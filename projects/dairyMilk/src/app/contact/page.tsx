import { Container } from '@/components/layout/Container';
import { ContactForm } from '@/components/ContactForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <Container>
      <div className="text-center mb-12">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Get In Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about our products, farming practices, or just want to say hello, please reach out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
            <CardDescription>Find us or drop us a line.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Our Farm Address</h3>
                <p className="text-muted-foreground">123 Dairy Lane, Farmville, FS 54321</p>
                <p className="text-xs text-muted-foreground">(Not a real address)</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Call Us</h3>
                <p className="text-muted-foreground">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Email Us</h3>
                <p className="text-muted-foreground">hello@dairydelights.farm</p>
              </div>
            </div>
            {/* Optional: Add business hours */}
            {/* <div>
              <h3 className="font-semibold">Farm Shop Hours</h3>
              <p className="text-muted-foreground">Monday - Friday: 9 AM - 5 PM</p>
              <p className="text-muted-foreground">Saturday: 10 AM - 3 PM</p>
              <p className="text-muted-foreground">Sunday: Closed</p>
            </div> */}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
