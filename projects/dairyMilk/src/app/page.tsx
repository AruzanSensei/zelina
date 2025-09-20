import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DairyFactGenerator } from '@/components/DairyFactGenerator';
import { Container } from '@/components/layout/Container';
import { ChevronRight, ShoppingBag, BookOpen, Images, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-accent/30 to-background pt-16 pb-20 text-center">
        <Container className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">Dairy Delights</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Experience the taste of tradition with our farm-fresh dairy products, crafted with care and dedication.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Our Products
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/about">
                <BookOpen className="mr-2 h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </div>
        </Container>
        <Image
          src="https://placehold.co/1920x800.png"
          alt="Dairy farm picturesque landscape"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20"
          data-ai-hint="dairy farm landscape"
          priority
        />
      </div>

      {/* Dairy Fact Section */}
      <Container>
        <DairyFactGenerator />
      </Container>

      {/* Feature Links Section */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="h-10 w-10 text-primary" />}
            title="Our Story"
            description="Discover the history and passion behind Dairy Delights."
            href="/about"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="Vintage dairy equipment"
            dataAiHint="dairy history"
          />
          <FeatureCard
            icon={<Images className="h-10 w-10 text-primary" />}
            title="Farm Gallery"
            description="A glimpse into life at our dairy farm and our happy cows."
            href="/gallery"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="Happy cows in a field"
            dataAiHint="happy cows"
          />
          <FeatureCard
            icon={<Phone className="h-10 w-10 text-primary" />}
            title="Get In Touch"
            description="Have questions? We'd love to hear from you!"
            href="/contact"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="Friendly farmer smiling"
            dataAiHint="friendly farmer"
          />
        </div>
      </Container>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

function FeatureCard({ icon, title, description, href, imageSrc, imageAlt, dataAiHint }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Image 
        src={imageSrc} 
        alt={imageAlt} 
        width={600} 
        height={400} 
        className="w-full h-48 object-cover"
        data-ai-hint={dataAiHint} 
      />
      <CardHeader>
        <div className="flex items-center gap-4">
          {icon}
          <CardTitle className="text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
        <Button asChild variant="link" className="mt-4 px-0 text-primary">
          <Link href={href}>
            Learn More <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
