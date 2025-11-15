
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "What materials are your jewelry made of?",
    answer: "We offer modern, trending jewellery in all varieties, including anti-tarnish, gold-plated, silver-plated, and more. For complete details, please check the description of each product."
  },
  {
    question: "How do I care for my jewelry?",
    answer: "To keep your jewelry looking its best, avoid contact with perfumes, lotions, and water. Store it in a dry, cool place, preferably in the pouch or box it came in. Clean gently with a soft, dry cloth."
  },
  {
    question: "What is your shipping policy?",
    answer: "We offer free standard shipping on all orders above ₹500 within India. Please see our Shipping & Returns page for detailed information."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 7 days of delivery for a full refund or exchange, provided the item is in its original, unworn condition. Please visit our Shipping & Returns page for instructions on how to initiate a return."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has shipped, You can find your order status and tracking information in the 'Order History' section of your account."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within India. We are working on expanding our shipping options to more countries in the near future."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Find answers to common questions about our products, shipping, and policies.</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
