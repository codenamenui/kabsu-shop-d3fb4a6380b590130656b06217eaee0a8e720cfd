"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Package,
  Tags,
  Info,
  CreditCard,
  Image as ImageIcon,
  Layers,
  Tag,
  PlusCircle,
  Save,
  Loader2,
} from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FetchedMerch, Category } from "@/constants/type";

interface MerchFormProps {
  merch?: FetchedMerch;
  categories: Category[];
  shopId: string;
}

const ModifyMerch: React.FC<MerchFormProps> = ({
  merch,
  categories,
  shopId,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FetchedMerch>>({
    name: merch?.name || "",
    description: merch?.description || "",
    receiving_information: merch?.receiving_information || "",
    variant_name: merch?.variant_name || "",
    online_payment: merch?.online_payment || false,
    physical_payment: merch?.physical_payment || false,
    cancellable: merch?.cancellable || false,
    merchandise_pictures: merch?.merchandise_pictures || [],
    variants: merch?.variants || [],
    merchandise_categories: merch?.merchandise_categories || [],
  });

  const [newVariant, setNewVariant] = useState({
    picture_url: "",
    name: "",
    original_price: 0,
    membership_price: 0,
  });

  useEffect(() => {
    if (merch?.variant_name) {
      setFormData((prev) => ({
        ...prev,
        variant_name: merch.variant_name,
      }));
    }
  }, [merch]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field: keyof FetchedMerch) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);

      // Create new picture objects with temporary blob URLs
      const newPictureObjects = fileArray.map((file) => ({
        picture_url: URL.createObjectURL(file),
        file: file, // Store the actual file for later upload
      }));

      setFormData((prev) => ({
        ...prev,
        merchandise_pictures: [
          ...(prev.merchandise_pictures || []),
          ...newPictureObjects,
        ],
      }));
    }
  };

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.original_price > 0) {
      setFormData((prev) => ({
        ...prev,
        variants: [...(prev.variants || []), newVariant],
      }));
      setNewVariant({
        picture_url: "",
        name: "",
        original_price: 0,
        membership_price: 0,
      });
    }
  };

  const handleRemovePicture = (index: number) => {
    const pictureToRemove = formData.merchandise_pictures?.[index];

    // If it's a temporary blob URL, revoke it
    if (pictureToRemove?.picture_url.startsWith("blob:")) {
      URL.revokeObjectURL(pictureToRemove.picture_url);
    }

    setFormData((prev) => ({
      ...prev,
      merchandise_pictures: prev.merchandise_pictures?.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      merchandise_categories: [{ cat_id: categoryId }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Determine if we're inserting a new merchandise or updating an existing one
      let merchandiseId;
      if (merch?.id) {
        // Update existing merchandise
        const { data, error: updateError } = await supabase
          .from("merchandises")
          .update({
            name: formData.name,
            description: formData.description,
            online_payment: formData.online_payment,
            physical_payment: formData.physical_payment,
            cancellable: formData.cancellable,
            receiving_information: formData.receiving_information,
            variant_name: formData.variant_name,
          })
          .eq("id", merch.id)
          .select();

        if (updateError) throw updateError;
        merchandiseId = merch.id;

        // Handle merchandise categories update
        if (formData.merchandise_categories?.[0]?.cat_id) {
          const { data: existingCategory } = await supabase
            .from("merchandise_categories")
            .select()
            .eq("merch_id", merch.id)
            .single();

          if (existingCategory) {
            const { error: categoryUpdateError } = await supabase
              .from("merchandise_categories")
              .update({
                cat_id: formData.merchandise_categories[0].cat_id,
              })
              .eq("merch_id", merch.id);

            if (categoryUpdateError) throw categoryUpdateError;
          } else {
            const { error: categoryInsertError } = await supabase
              .from("merchandise_categories")
              .insert({
                cat_id: formData.merchandise_categories[0].cat_id,
                merch_id: merch.id,
              });

            if (categoryInsertError) throw categoryInsertError;
          }
        }

        // Handle variants update for existing merchandise
        if (formData.variants && formData.variants.length > 0) {
          // Fetch existing variants
          const { data: existingVariants, error: fetchVariantsError } =
            await supabase
              .from("variants")
              .select()
              .eq("merch_id", merchandiseId);

          if (fetchVariantsError) throw fetchVariantsError;

          // Delete variants that are no longer in the form data
          const variantsToDelete = existingVariants?.filter(
            (existingVariant) =>
              !formData.variants?.some(
                (formVariant) => formVariant.name === existingVariant.name,
              ),
          );

          if (variantsToDelete && variantsToDelete.length > 0) {
            const { error: deleteVariantsError } = await supabase
              .from("variants")
              .delete()
              .in(
                "id",
                variantsToDelete.map((v) => v.id),
              );

            if (deleteVariantsError) throw deleteVariantsError;
          }

          // Update or insert variants
          for (const variant of formData.variants) {
            const existingVariant = existingVariants?.find(
              (v) => v.name === variant.name,
            );

            if (existingVariant) {
              // Update existing variant
              const { error: updateVariantError } = await supabase
                .from("variants")
                .update({
                  name: variant.name,
                  original_price: Math.round(variant.original_price), // Convert to cents
                  membership_price: Math.round(variant.membership_price), // Convert to cents
                  picture_url: variant.picture_url || "", // Use existing picture or empty string
                })
                .eq("id", existingVariant.id);

              if (updateVariantError) throw updateVariantError;
            } else {
              // Insert new variant
              const { error: insertVariantError } = await supabase
                .from("variants")
                .insert({
                  merch_id: merchandiseId,
                  name: variant.name,
                  original_price: Math.round(variant.original_price), // Convert to cents
                  membership_price: Math.round(variant.membership_price), // Convert to cents
                  picture_url: variant.picture_url || "", // Optional picture URL
                });

              if (insertVariantError) throw insertVariantError;
            }
          }
        }
      } else {
        // Insert new merchandise
        const { data, error: insertError } = await supabase
          .from("merchandises")
          .insert({
            name: formData.name,
            description: formData.description,
            shop_id: shopId,
            online_payment: formData.online_payment,
            physical_payment: formData.physical_payment,
            cancellable: formData.cancellable,
            receiving_information: formData.receiving_information,
            variant_name: formData.variant_name,
            ready: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        merchandiseId = data.id;

        // Insert new category
        if (formData.merchandise_categories?.[0]?.cat_id) {
          const { error: categoryError } = await supabase
            .from("merchandise_categories")
            .insert({
              cat_id: formData.merchandise_categories[0].cat_id,
              merch_id: merchandiseId,
            });

          if (categoryError) throw categoryError;
        }

        // Insert variants for new merchandise
        if (formData.variants && formData.variants.length > 0) {
          const variantsToInsert = formData.variants.map((variant) => ({
            merch_id: merchandiseId,
            name: variant.name,
            original_price: Math.round(variant.original_price), // Convert to cents
            membership_price: Math.round(variant.membership_price), // Convert to cents
            picture_url: variant.picture_url || "", // Optional picture URL
          }));

          const { error: variantInsertError } = await supabase
            .from("variants")
            .insert(variantsToInsert);

          if (variantInsertError) throw variantInsertError;
        }
      }

      // Handle merchandise pictures
      await handleMerchandisePictures(supabase, merchandiseId, formData);

      toast.success("Merchandise saved successfully");
      router.push(`/manage-shop/${shopId}`);
      router.refresh();
    } catch (error) {
      console.error("Error in merchandise submission:", error);
      toast.error("Failed to save merchandise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMerchandisePictures = async (
    supabase: SupabaseClient,
    merchandiseId: number,
    formData: Partial<FetchedMerch>,
  ) => {
    // Fetch existing pictures from the database
    const { data: existingPictures, error: fetchError } = await supabase
      .from("merchandise_pictures")
      .select("picture_url")
      .eq("merch_id", merchandiseId);

    if (fetchError) {
      throw fetchError;
    }

    // Determine pictures to delete (those in existing pictures but not in current form data)
    const picturesToDelete =
      existingPictures?.filter((existingPic) => {
        const isInFormData = formData.merchandise_pictures?.some(
          (formPic) => formPic.picture_url === existingPic.picture_url,
        );
        return !isInFormData;
      }) || [];

    // Remove pictures from storage and database
    for (const pictureToDelete of picturesToDelete) {
      try {
        // Extract file path from the full URL
        const filePath = pictureToDelete.picture_url
          .split("/")
          .slice(-2)
          .join("/");

        // Remove from storage
        await supabase.storage.from("merch-picture").remove([filePath]);

        // Remove from database
        await supabase
          .from("merchandise_pictures")
          .delete()
          .eq("picture_url", pictureToDelete.picture_url);
      } catch (deleteError) {
        console.error("Error deleting picture:", deleteError);
      }
    }

    // Upload new pictures (those with blob URLs)
    const newPicturesToUpload =
      formData.merchandise_pictures?.filter(
        (pic) => pic.file && pic.picture_url.startsWith("blob:"),
      ) || [];

    for (const newPic of newPicturesToUpload) {
      try {
        if (!newPic.file) continue;

        // Generate unique filename
        const merch_url = `merch_${formData.name}_${Date.now()}_${newPic.file.name}`;

        // Upload to storage
        const { data: uploadData, error: storageError } = await supabase.storage
          .from("merch-picture")
          .upload(merch_url, newPic.file);

        if (storageError) throw storageError;

        // Get public URL
        const {
          data: { publicUrl: merchUrl },
        } = supabase.storage.from("merch-picture").getPublicUrl(merch_url);

        // Insert picture record
        const { error: pictureError } = await supabase
          .from("merchandise_pictures")
          .insert({
            picture_url: merchUrl,
            merch_id: merchandiseId,
          });

        if (pictureError) throw pictureError;

        // Revoke blob URL
        URL.revokeObjectURL(newPic.picture_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // Add this method inside the ModifyMerch component, before the return statement
  const handleVariantChange = (
    index: number,
    field: "name" | "original_price" | "membership_price",
    value: string | number,
  ) => {
    setFormData((prev) => {
      // Create a copy of the variants array
      const updatedVariants = [...(prev.variants || [])];

      // Update the specific variant at the given index
      if (updatedVariants[index]) {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [field]: value,
        };
      }

      return {
        ...prev,
        variants: updatedVariants,
      };
    });
  };

  return (
    <Card className="w-full max-w-3xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            {merch ? "Modify Merchandise" : "Create New Merchandise"}
          </CardTitle>
          <CardDescription className="text-base">
            {merch
              ? "Update the details of existing merchandise"
              : "Add a new merchandise item"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Info className="h-5 w-5" />
              Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Name
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter merchandise name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Variant Name
                </Label>
                <Input
                  name="variant_name"
                  value={formData.variant_name}
                  onChange={handleInputChange}
                  placeholder="Enter variant type (e.g., Size, Color)"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your merchandise"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Category and Payment Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Tag className="h-5 w-5" />
              Category & Payment Options
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </Label>
                <Select
                  value={formData.merchandise_categories?.[0]?.cat_id?.toString()}
                  onValueChange={(value) => handleCategoryChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online_payment"
                      checked={formData.online_payment}
                      onCheckedChange={() =>
                        handleCheckboxChange("online_payment")
                      }
                    />
                    <Label
                      htmlFor="online_payment"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Online
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="physical_payment"
                      checked={formData.physical_payment}
                      onCheckedChange={() =>
                        handleCheckboxChange("physical_payment")
                      }
                    />
                    <Label htmlFor="physical_payment">Physical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cancellable"
                      checked={formData.cancellable}
                      onCheckedChange={() =>
                        handleCheckboxChange("cancellable")
                      }
                    />
                    <Label htmlFor="cancellable">Cancellable</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pictures Section */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <ImageIcon className="h-5 w-5" />
              Merchandise Pictures
            </h3>
            <div className="space-y-4">
              {formData.merchandise_pictures &&
                formData.merchandise_pictures.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {formData.merchandise_pictures.map((pic, index) => (
                      <div
                        key={`pic-${index}`}
                        className="relative aspect-square"
                      >
                        <img
                          src={pic.picture_url}
                          alt={`Merchandise ${index + 1}`}
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                          onClick={() => handleRemovePicture(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file"
                      className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <Input
                        id="file"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Layers className="h-5 w-5" />
              Product Variants
            </h3>
            {/* <p className="mb-4 text-sm text-gray-600">
              Add different versions of your merchandise (e.g., sizes, colors,
              styles). Each variant must have a regular price and a discounted
              member price.
            </p> */}

            <div className="space-y-4">
              {/* Existing Variants */}
              {formData.variants?.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-4"
                >
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                      Variant Name
                    </label>
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Small, Red, Classic"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                      Regular Price (P)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.original_price}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "original_price",
                          Number(e.target.value),
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                      Member Price (P)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.membership_price}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "membership_price",
                          Number(e.target.value),
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          variants: prev.variants?.filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              {/* New Variant Form */}
              <div className="grid grid-cols-1 gap-2 rounded-lg border bg-gray-50 p-3 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">
                    New Variant Name
                  </label>
                  <Input
                    value={newVariant.name}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Small, Red, Classic"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">
                    Regular Price (P)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newVariant.original_price}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        original_price: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">
                    Member Price (P)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newVariant.membership_price}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        membership_price: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full"
                    disabled={
                      !newVariant.name ||
                      !newVariant.original_price ||
                      !newVariant.membership_price
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Receiving Information */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Info className="h-5 w-5" />
              Delivery Information
            </h3>
            {/* <p className="mb-4 text-sm text-gray-600">
              Provide details about how customers can receive or pick up their
              merchandise. Include location, timing, and any special
              instructions.
            </p> */}
            <Textarea
              name="receiving_information"
              value={formData.receiving_information}
              onChange={handleInputChange}
              placeholder="Example: Available for pickup at the student center Monday-Friday, 9 AM - 5 PM. Please bring your student ID."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting ||
              formData.variants?.length <= 0 ||
              formData.receiving_information == undefined ||
              !formData.merchandise_pictures ||
              formData.merchandise_pictures.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {merch ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {merch ? "Update Merchandise" : "Create Merchandise"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ModifyMerch;
