"use client";

import { Button } from "@spnd/ui/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@spnd/ui/components/ui/accordion";

const items = [
  {
    value: "item-1",
    trigger: "Test Item 1",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam delectus totam quasi veritatis placeat tempora, adipisci sapiente sit consequatur! Rem, iure quibusdam. Commodi iste aliquid quos? Exercitationem quibusdam architecto nisi?,",
  },
  {
    value: "item-2",
    trigger: "Test Item 2",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem ea inventore excepturi ipsa. Fugiat aliquam quos tempore magnam reprehenderit eveniet alias error labore! Assumenda perferendis itaque deleniti nesciunt. Quo, quos.",
  },
  {
    value: "item-3",
    trigger: "Test Item 3",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus blanditiis corrupti dolorum expedita unde perspiciatis odit animi vero. Quisquam aspernatur placeat sequi esse unde earum assumenda quos nihil fugit eveniet!",
  },
];

export default function Home() {
  return (
    <div className="mx-auto space-y-4">
      <h1 className="font-bold text-2xl">Welcome to Spnd!</h1>
      <p>Personal Finance Tracking Application</p>
      <Button variant={"default"} onClick={() => alert("Hello!")}>
        Test Button!
      </Button>
      <Accordion defaultValue={["item-1"]} className="max-w-lg">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
