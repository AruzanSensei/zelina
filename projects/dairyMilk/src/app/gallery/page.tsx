import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Images } from 'lucide-react';

const galleryItems = [
  { src: "https://placehold.co/600x400.png", alt: "Cows grazing in a sunny pasture", dataAiHint: "cows pasture" },
  { src: "https://placehold.co/600x400.png", alt: "Close-up of a dairy cow's face", dataAiHint: "cow face" },
  { src: "https://placehold.co/600x400.png", alt: "Farmer milking a cow", dataAiHint: "farmer milking" },
  { src: "https://placehold.co/600x400.png", alt: "Freshly bottled milk", dataAiHint: "milk bottles" },
  { src: "https://placehold.co/600x400.png", alt: "Cheese aging on wooden shelves", dataAiHint: "cheese aging" },
  { src: "https://placehold.co/600x400.png", alt: "Panoramic view of the dairy farm", dataAiHint: "dairy farm view" },
  { src: "https://placehold.co/600x400.png", alt: "Children feeding a calf", dataAiHint: "children calf" },
  { src: "https://placehold.co/600x400.png", alt: "Artisan yogurt in a bowl", dataAiHint: "yogurt bowl" },
  { src: "https://placehold.co/600x400.png", alt: "Sunset over the farm fields", dataAiHint: "farm sunset" },
];

// TODO: Add video support later if needed. For now, images only.

export default function GalleryPage() {
  return (
    <Container>
      <div className="text-center mb-12">
        <Images className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Farm Gallery</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Take a peek into daily life at Dairy Delights. See our beautiful farm, happy animals, and the care that goes into every product.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item, index) => (
          <Card key={index} className="overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardContent className="p-0">
              <div className="aspect-w-16 aspect-h-9"> {/* Or use fixed aspect ratio e.g. aspect-[4/3] */}
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                  data-ai-hint={item.dataAiHint}
                />
              </div>
              {/* Optional: Add a caption area if needed, or hover effect with text */}
              {/* <div className="p-4"> <p className="text-sm text-muted-foreground">{item.alt}</p> </div> */}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
