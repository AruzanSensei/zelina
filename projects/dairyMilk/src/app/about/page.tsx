import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Tractor, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  return (
    <Container>
      <div className="space-y-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">About Dairy Delights</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about our journey, our values, and our commitment to bringing you the finest dairy products.
          </p>
        </section>

        <Card className="overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/800x600.png"
                alt="Dairy farm family"
                width={800}
                height={600}
                className="object-cover w-full h-64 md:h-full"
                data-ai-hint="dairy farm family"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl">Our History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-foreground">
                <p>
                  Dairy Delights began as a small family farm three generations ago, with a simple mission: to produce wholesome, delicious dairy products using traditional methods and a deep respect for nature.
                </p>
                <p>
                  Over the years, we've grown, but our core values remain unchanged. We believe in sustainable farming, animal welfare, and the importance of community. Every drop of milk and every product we create is a testament to this heritage.
                </p>
                <p>
                  From hand-milking a few cherished cows to employing modern, ethical farming practices, our journey has been one of passion and perseverance. We are proud to share the fruits of our labor with you.
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden shadow-lg">
          <div className="md:flex md:flex-row-reverse">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/800x600.png"
                alt="Modern milking parlor"
                width={800}
                height={600}
                className="object-cover w-full h-64 md:h-full"
                data-ai-hint="milking parlor modern"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8">
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Tractor className="h-8 w-8 text-primary" />
                  <CardTitle className="text-3xl">Farming Practices</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-foreground">
                <p>
                  We are committed to sustainable and ethical farming. Our cows graze on lush, open pastures and are treated with the utmost care and respect. We believe that happy cows produce the best milk.
                </p>
                <p>
                  Our farm utilizes a blend of time-honored techniques and modern technology to ensure the highest quality standards while minimizing our environmental impact. We focus on soil health, water conservation, and biodiversity.
                </p>
                <p>
                  We avoid the use of unnecessary antibiotics and hormones, ensuring our milk is as pure and natural as possible. Transparency is key to our operations, and we welcome questions about how we raise our animals and produce our goods.
                </p>
              </CardContent>
            </div>
          </div>
        </Card>

         <section className="text-center py-10 bg-accent/50 rounded-lg">
          <HeartHandshake className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-semibold text-foreground">Our Commitment to You</h2>
          <p className="mt-3 text-md text-muted-foreground max-w-xl mx-auto">
            At Dairy Delights, we're more than just a dairy. We're a part of your community, dedicated to providing fresh, nutritious, and delicious products that you can trust.
          </p>
        </section>
      </div>
    </Container>
  );
}
