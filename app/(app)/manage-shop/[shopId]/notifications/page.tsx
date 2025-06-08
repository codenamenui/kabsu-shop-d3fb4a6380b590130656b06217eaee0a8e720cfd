"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell, Package, CreditCard, UserCheck } from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";
import { format } from "date-fns";

interface Order {
  id: number;
  quantity: number;
  price: number;
  status_id: number;
  profiles: {
    first_name: string;
    last_name: string;
    student_number: string;
    email: string;
    contact_number: string;
    section: string;
    year: string;
    colleges: { name: string };
    programs: { name: string };
  };
  variants: {
    id: number;
    name: string;
  };
  merchandises: {
    name: string;
    merchandise_pictures: { picture_url: string }[];
  };
  order_statuses: {
    id: number;
    paid: boolean;
    received: boolean;
    received_at: string | null;
    cancelled: boolean;
    cancelled_at: string | null;
    cancel_reason: string | null;
  };
}

interface Notification {
  id: number;
  created_at: string;
  message: string;
  seen: boolean;
  order_id: number | null;
  orders: Order | null;
}

const ShopNotifications = ({ params }: { params: { shopId: string } }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const shopId = parseInt(params.shopId);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isNaN(shopId)) {
        setError("Invalid shop ID");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("shop_notifications")
          .select(
            `
            id,
            created_at,
            message,
            seen,
            order_id,
            orders (
              id,
              quantity,
              price,
              variants (id, name),
              merchandises (
                name,
                merchandise_pictures (picture_url)
              ),
              profiles (
                student_number,
                first_name,
                last_name,
                email,
                contact_number,
                section,
                year,
                colleges (name),
                programs (name)
              ),
              order_statuses (
                id,
                paid,
                received,
                received_at,
                cancelled,
                cancelled_at,
                cancel_reason
              )
            )
          `,
          )
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data || []);

        const unseenNotifications =
          data?.filter((n) => !n.seen).map((n) => n.id) || [];
        if (unseenNotifications.length > 0) {
          const { error: updateError } = await supabase
            .from("shop_notifications")
            .update({ seen: true })
            .in("id", unseenNotifications);

          if (updateError) throw updateError;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [shopId, supabase]);

  // Group notifications by date
  const groupedNotifications = notifications.reduce(
    (acc, notification) => {
      const date = new Date(notification.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(notification);
      return acc;
    },
    {} as Record<string, Notification[]>,
  );

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">
            Error loading notifications: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
          <Bell className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(
                ([date, dayNotifications]) => (
                  <div key={date} className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500">
                      {date}
                    </h3>
                    <div className="space-y-4">
                      {dayNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-lg border p-4 ${
                            notification.seen
                              ? "bg-gray-50"
                              : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-full space-y-3">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.message}
                                </p>
                                {!notification.seen && (
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>

                              {notification.order_id && notification.orders && (
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                  <div className="flex items-start gap-4">
                                    {notification.orders.merchandises
                                      .merchandise_pictures[0]?.picture_url && (
                                      <img
                                        src={
                                          notification.orders.merchandises
                                            .merchandise_pictures[0].picture_url
                                        }
                                        alt={
                                          notification.orders.merchandises.name
                                        }
                                        className="h-16 w-16 rounded-md object-cover"
                                      />
                                    )}
                                    <div className="flex-1 space-y-2">
                                      <div className="flex justify-between">
                                        <div>
                                          <h4 className="font-medium">
                                            Order #{notification.orders.id}
                                          </h4>
                                          <p className="text-sm text-gray-600">
                                            {
                                              notification.orders.merchandises
                                                .name
                                            }{" "}
                                            -{" "}
                                            {notification.orders.variants.name}
                                          </p>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Quantity:{" "}
                                          {notification.orders.quantity} |
                                          Price: P{notification.orders.price}
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <span
                                          className={`inline-flex items-center rounded px-2 py-1 text-xs ${
                                            notification.orders.order_statuses
                                              .paid
                                              ? "bg-green-100 text-green-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {notification.orders.order_statuses
                                            .paid
                                            ? "Paid"
                                            : "Unpaid"}
                                        </span>
                                        <span
                                          className={`inline-flex items-center rounded px-2 py-1 text-xs ${
                                            notification.orders.order_statuses
                                              .received
                                              ? "bg-blue-100 text-blue-800"
                                              : notification.orders
                                                    .order_statuses.cancelled
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {notification.orders.order_statuses
                                            .received
                                            ? "Received"
                                            : notification.orders.order_statuses
                                                  .cancelled
                                              ? "Cancelled"
                                              : "Pending"}
                                        </span>
                                      </div>

                                      <div className="text-sm">
                                        <p className="text-gray-600">
                                          {
                                            notification.orders.profiles
                                              .first_name
                                          }{" "}
                                          {
                                            notification.orders.profiles
                                              .last_name
                                          }{" "}
                                          | Student:{" "}
                                          {
                                            notification.orders.profiles
                                              .student_number
                                          }
                                        </p>
                                        <p className="text-gray-600">
                                          {
                                            notification.orders.profiles
                                              .colleges.name
                                          }{" "}
                                          -{" "}
                                          {
                                            notification.orders.profiles
                                              .programs.name
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-gray-500">
                                {format(
                                  new Date(notification.created_at),
                                  "h:mm a",
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopNotifications;
