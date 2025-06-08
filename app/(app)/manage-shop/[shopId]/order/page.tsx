"use client";

import React, { useEffect, useState } from "react";
import { Orders } from "@/constants/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Received from "./mark-as-received";
import { createClient } from "@/supabase/clients/createClient";
import PaymentReceiptDialog from "./PaymentReceiptDialog";
import ExpandableText from "@/components/expandable-text";

type Payment = {
  picture_url: string;
  order_id: string;
};

const OrderPage = ({ params }: { params: { shopId: string } }) => {
  const supabase = createClient();
  const [orders, setOrders] = useState<Orders[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const getData = async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
      id, 
      quantity, 
      price, 
      variants(id, name), 
      merchandises(id, name, merchandise_pictures(picture_url)), 
      profiles(
        student_number, 
        first_name, 
        last_name, 
        email, 
        contact_number,
        section,
        year,
        colleges(name), 
        programs(name)
      ), 
      order_statuses(
        id,
        paid, 
        received, 
        received_at, 
        cancelled, 
        cancelled_at, 
        cancel_reason
      )
    `,
        )
        .eq("shop_id", params.shopId)
        .returns<Orders[]>();

      const orderIds = orders?.map((order) => order.id);

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("picture_url, order_id")
        .in("order_id", orderIds ?? [])
        .returns<Payment[]>();

      setOrders(orders ?? []);
      setPayments(payments ?? []);
    };
    getData();
  }, []);

  const getPaymentForOrder = (orderId: string) => {
    return payments.find((payment) => payment.order_id === orderId);
  };

  // Group orders by merchandise
  const groupedOrders = orders
    ? orders.reduce(
        (acc, order) => {
          const merchName = order.merchandises.name;
          if (!acc[merchName]) {
            acc[merchName] = {
              merchandise: order.merchandises,
              orders: [],
              totalQuantity: 0,
              totalPrice: 0,
            };
          }
          acc[merchName].orders.push(order);
          acc[merchName].totalQuantity += order.quantity;
          acc[merchName].totalPrice += order.price * order.quantity;
          return acc;
        },
        {} as Record<
          string,
          {
            merchandise: Orders["merchandises"];
            orders: Orders[];
            totalQuantity: number;
            totalPrice: number;
          }
        >,
      )
    : {};

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              No orders found
            </div>
          )}
          {Object.entries(groupedOrders).map(([merchName, merchGroup]) => (
            <div key={merchName} className="mb-6 border-b pb-4">
              <div className="mb-4 flex items-center space-x-4">
                {merchGroup.merchandise.merchandise_pictures[0]
                  ?.picture_url && (
                  <img
                    src={
                      merchGroup.merchandise.merchandise_pictures[0].picture_url
                    }
                    alt={merchName}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{merchName}</h2>
                  <div className="text-sm text-gray-600">
                    Total Quantity: {merchGroup.totalQuantity} | Total Revenue:
                    ${merchGroup.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {merchGroup.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex gap-10">
                      <div>
                        <div className="font-semibold">Order #{order.id}</div>
                        <div className="mt-1 text-sm text-gray-600">
                          Quantity: {order.quantity} | Price: P
                          {order.price.toFixed(2)}
                        </div>
                        <div className="mt-2 space-x-2">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs ${
                              order.order_statuses.paid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.order_statuses.paid ? "Paid" : "Unpaid"}
                          </span>
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs ${
                              order.order_statuses.received
                                ? "bg-blue-100 text-blue-800"
                                : order.order_statuses.cancelled
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.order_statuses.received
                              ? "Received"
                              : order.order_statuses.cancelled
                                ? "Cancelled"
                                : "Pending"}
                          </span>
                        </div>
                        {getPaymentForOrder(order.id)?.picture_url && (
                          <div className="mt-2">
                            <PaymentReceiptDialog
                              imageUrl={
                                getPaymentForOrder(order.id)?.picture_url ?? ""
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">Customer Details:</div>
                        <div className="text-gray-700">
                          {order.profiles.first_name} {order.profiles.last_name}
                        </div>
                        <div className="text-gray-600">
                          Student Number: {order.profiles.student_number}
                        </div>
                        <div className="text-gray-600">
                          Email: {order.profiles.email}
                        </div>
                        <div className="text-gray-600">
                          Contact Number: {order.profiles.contact_number}
                        </div>
                        <div className="text-gray-600">
                          College: {order.profiles.colleges.name}
                        </div>
                        <div className="text-gray-600">
                          Program: {order.profiles.programs.name}
                        </div>
                        <div className="text-gray-600">
                          Year and Section: {order.profiles.year} -{" "}
                          {order.profiles.section}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Received order={order} setOrders={setOrders} />
                      {order.order_statuses.cancelled &&
                        order.order_statuses.cancel_reason && (
                          <div className="mt-2 w-[200px] whitespace-normal break-words text-sm text-red-600">
                            Cancel Reason: {order.order_statuses.cancel_reason}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPage;
