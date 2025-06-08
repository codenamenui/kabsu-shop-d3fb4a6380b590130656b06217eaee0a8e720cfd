import React from "react";
import { LayoutDashboard, Building2, Store, List } from "lucide-react";
import Link from "next/link";

const AdminDashboard = () => {
  const adminLinks = [
    {
      icon: <Building2 className="h-10 w-10 text-blue-600" />,
      title: "Colleges",
      path: "/admin/college",
      description: "Manage college information and details",
    },
    {
      icon: <List className="h-10 w-10 text-green-600" />,
      title: "Programs",
      path: "/admin/program",
      description: "Add, edit, and manage academic programs",
    },
    {
      icon: <Store className="h-10 w-10 text-purple-600" />,
      title: "Shop",
      path: "/admin/shop",
      description: "Manage campus and partner shops",
    },
    {
      icon: <LayoutDashboard className="h-10 w-10 text-orange-600" />,
      title: "Categories",
      path: "/admin/categories",
      description: "Organize and manage content categories",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          System Administrator Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {adminLinks.map((link, index) => (
            <Link
              href={link.path}
              className="block rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                {link.icon}
                <h2 className="mt-4 text-xl font-semibold text-gray-700">
                  {link.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
