import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ShoppingBag } from 'lucide-react';

const products = [
  {
    name: "Fresh Whole Milk",
    description: "Creamy and delicious whole milk, pasteurized and non-homogenized.",
    sizes: ["1 Liter Glass Bottle", "2 Liter Jug"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "milk bottle",
  },
  {
    name: "Artisan Cheddar Cheese",
    description: "Aged for 12 months, this sharp cheddar offers a complex, nutty flavor.",
    sizes: ["200g Block", "500g Block"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "cheddar cheese",
  },
  {
    name: "Natural Greek Yogurt",
    description: "Thick and creamy Greek yogurt, perfect for breakfast or snacks.",
    sizes: ["500g Tub", "1kg Tub"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "yogurt tub",
  },
  {
    name: "Farmhouse Butter",
    description: "Rich, cultured butter made with fresh cream. Salted and Unsalted available.",
    sizes: ["250g Roll"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "butter roll",
  },
  {
    name: "Clotted Cream",
    description: "Luxuriously thick clotted cream, an essential for scones.",
    sizes: ["170g Jar"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "clotted cream",
  },
  {
    name: "Seasonal Fruit Kefir",
    description: "Probiotic-rich kefir, lightly sweetened with seasonal fruits.",
    sizes: ["500ml Bottle"],
    imageSrc: "https://placehold.co/400x300.png",
    dataAiHint: "kefir bottle",
  },
];

export default function ProductsPage() {
  return (
    <Container>
      <div className="text-center mb-12">
        <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Our Dairy Products</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our range of fresh, high-quality dairy products, made with love on our farm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {products.map((product) => (
          <Card key={product.name} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-56">
              <Image
                src={product.imageSrc}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-base mb-2">{product.description}</CardDescription>
              <p className="text-sm text-muted-foreground">
                Available sizes: {product.sizes.join(', ')}
              </p>
            </CardContent>
            <CardFooter>
              {/* Placeholder for future "Add to Cart" or "Learn More" specific to product */}
              <Button variant="outline" className="w-full" disabled>
                More Info Soon
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center py-10 bg-accent/50 rounded-lg">
        <h2 className="text-3xl font-semibold text-foreground">Ready to Order?</h2>
        <p className="mt-3 text-md text-muted-foreground max-w-xl mx-auto">
          Download our latest order form to place your order for local pickup or delivery (if available).
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/order-form.pdf" target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-5 w-5" />
            Download Order Form
          </Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          (This is a placeholder PDF)
        </p>
      </div>
    </Container>
  );
}
