"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string | React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-semibold transition-colors hover:text-emerald-700"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="text-emerald-800" /> : <ChevronDown />}
      </button>
      {isOpen && (
        <div className="mt-3 text-sm leading-relaxed text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

const KabsuShopFAQs = () => {
  const faqSections = [
    {
      header: "General Information",
      questions: [
        {
          question: "What is The Kabsu Shop?",
          answer:
            "The Kabsu Shop is an exclusive e-commerce platform for Cavite State University students. It allows student organizations to sell official merchandise to fellow students.",
        },
        {
          question: "Who can use The Kabsu Shop?",
          answer:
            "Only students with a valid cvsu.edu.ph Gmail account can access and use The Kabsu Shop.",
        },
        {
          question: "How does The Kabsu Shop work?",
          answer:
            "Student organizations post their merchandise for sale as pre-order items. Students can browse, place pre-orders, and claim their items at designated pick-up locations set by the sellers.",
        },
        {
          question: "What merchandise can student organizations sell?",
          answer:
            "The merchandise categories are determined and added by the system admin. Common categories include hoodies, lanyards, polo shirts, tote bags, and more. Check the platform for updated categories.",
        },
      ],
    },
    {
      header: "Account Management",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "You can create an account using your cvsu.edu.ph Gmail address. Simply click on 'Sign in' and verify your email address.",
        },
        {
          question: "I'm having trouble logging in. What should I do?",
          answer:
            "Double-check that you're using your cvsu.edu.ph Gmail address. If the problem persists, try resetting your password or contact our support team.",
        },
        {
          question: "Can I use my personal Gmail account?",
          answer:
            "No, only official cvsu.edu.ph Gmail accounts are allowed to ensure exclusivity for Cavite State University students.",
        },
      ],
    },
    {
      header: "Buying Process",
      questions: [
        {
          question: "What payment methods are accepted?",
          answer:
            "The Kabsu Shop accepts two payment methods:\n1. In-person payment at the seller's designated claiming location.\n2. GCash payment, with details provided during checkout.",
        },
        {
          question:
            "Can I get discounts as a member of a student organization?",
          answer:
            "Discounts may be applied to items for members of a student organization. It depends on the student organization if they offer a discounted price for their members. Check the product details or contact the seller for confirmation.",
        },
        {
          question: "Are all items pre-order only?",
          answer:
            "Yes, all items on The Kabsu Shop are pre-order only, as the student organizations produce merchandise based on pre-orders. Make sure to check the product's estimated production and claiming timeline before placing an order.",
        },
        {
          question:
            "Can I add items from multiple student organizations to my cart?",
          answer:
            "Yes, you can add items from different organizations to your cart. However, you need to check out separately by student organization shop, as each organization handles its own transactions.",
        },
        {
          question: "How do I claim my purchased items?",
          answer:
            "After completing your pre-order, you can claim your items at the seller's designated claiming location, such as the CEIT building. The claiming location and dates will be provided in the product description and during checkout.",
        },
        {
          question: "Can I cancel my order?",
          answer:
            "Cancellation policies depend on the student organization selling the merchandise. Some items may be cancellable, while others are non-refundable. Check the cancellation policy on the seller's shop page or product description before completing your purchase.",
        },
        {
          question: "What happens if I don't claim my order on time?",
          answer:
            "If you fail to claim your order within the time specified by the seller, your order may be canceled. Contact the seller directly to resolve any issues.",
        },
      ],
    },
    {
      header: "Seller Guidelines",
      questions: [
        {
          question: "Who can create a shop on The Kabsu Shop?",
          answer:
            "Only the system admin can create a shop on The Kabsu Shop. Student organization officers must apply to have their organization registered as a shop.",
        },
        {
          question: "How do we apply to become a seller?",
          answer:
            "To apply, contact the system admin with the necessary details about your organization. Once your application is verified, the admin will register your organization as a shop on the platform.",
        },
        {
          question: "What merchandise can we sell?",
          answer:
            "The merchandise categories available for sale depend on the system admin, who can add or adjust the allowed categories. These categories might include hoodies, lanyards, tote bags, polo shirts, and more.",
        },
        {
          question: "How do we manage our shop?",
          answer:
            "Approved sellers can log in to the seller dashboard to:\n• View a dashboard with order and sale summaries.\n• Add merchandise and manage product details, such as photos, descriptions, and prices.\n• Manage shop profile, including shop description and contact details.\n• Add officers, if multiple sellers or claim points are involved.\n• Track orders and payments to ensure smooth transactions.",
        },
        {
          question: "Can we set a policy for order cancellations?",
          answer:
            "Yes, sellers can decide whether their pre-order items are cancellable or non-cancellable. Ensure you clearly state your cancellation policy on your shop page and product listings.",
        },
      ],
    },
    {
      header: "Claiming and Pick-Up",
      questions: [
        {
          question: "Where do I claim my orders?",
          answer:
            "Claiming locations are set by the seller and will be specified in the product description or during checkout.",
        },
        {
          question: "Can someone else claim my order on my behalf?",
          answer:
            "This depends on the seller's policy. Some sellers may allow authorized representatives to claim orders. Be sure to confirm this with the seller.",
        },
        {
          question: "What should I bring when claiming my order?",
          answer:
            "The requirements for claiming orders are determined by the student organizations.",
        },
      ],
    },
    {
      header: "Technical Support",
      questions: [
        {
          question:
            "What should I do if I encounter an issue with the website?",
          answer:
            "Report any technical problems in our email to our support team. Be sure to include screenshots and a description of the issue for faster assistance.",
        },
      ],
    },
    {
      header: "Additional Information",
      questions: [
        {
          question: "Are promotions or discounts offered on The Kabsu Shop?",
          answer:
            "Promotions and discounts are determined by individual student organizations. Check their shop pages for any updates.",
        },
        {
          question: "Can I suggest new features for The Kabsu Shop?",
          answer:
            "Absolutely! We value student feedback. You can contact our email to share your ideas or suggestions.",
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-emerald-900">
        The Kabsu Shop FAQs
      </h1>
      <div className="rounded-lg bg-white p-6 shadow-md">
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="mb-4 border-b pb-2 text-xl font-bold text-emerald-800">
              {section.header}
            </h2>
            {section.questions.map((faq, faqIndex) => (
              <FAQItem
                key={`${sectionIndex}-${faqIndex}`}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Still have questions? Contact our support team.</p>
      </div>
    </div>
  );
};

export default KabsuShopFAQs;
