/**
 * app-data.js
 * Alpine.js application data store.
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("aiApp", () => ({
    darkMode: false,
    mobileMenuOpen: false,
    activeDropdown: null,
    currentYear: new Date().getFullYear(),

    init() {
      const saved = localStorage.getItem("darkMode");
      this.darkMode = saved ? JSON.parse(saved) : false;
      this.applyDarkMode();
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(this.darkMode));
      this.applyDarkMode();
    },

    applyDarkMode() {
      document.documentElement.classList.toggle("dark", this.darkMode);
    },

    toggleDropdown(name) {
      this.activeDropdown = this.activeDropdown === name ? null : name;
    },

    products: [
      { id: "text", name: "Text Generator", href: "text-generator.html", icon: "message-circle", img: "assets/images/tab-image/tab-image-1", title: "AI Text Generator" },
      { id: "image", name: "Image Generator", href: "image-generator.html", icon: "image", img: "assets/images/tab-image/tab-image-2", title: "AI Image Generator" },
      { id: "code", name: "Code Generator", href: "code-generator.html", icon: "code-2", img: "assets/images/tab-image/tab-image-3", title: "AI Code Generator" },
      { id: "video", name: "Video Generator", href: "video-generator.html", icon: "video", img: "assets/images/tab-image/tab-image-4", title: "AI Video Generator" },
      { id: "email", name: "Email Generator", href: "email-generator.html", icon: "mail", img: "assets/images/tab-image/tab-image-5", title: "AI Email Generator" },
    ],

    pages: [
      { name: "Dashboard", href: "dashboard.html" },
      { name: "Pricing", href: "pricing.html" },
      { name: "Blog Grids", href: "blog-grid.html" },
      { name: "Blog Details", href: "blog-details.html" },
      { name: "Sign In", href: "signin.html" },
      { name: "Sign Up", href: "signup.html" },
      { name: "Reset Password", href: "forgot-password.html" },
      { name: "Privacy Policy", href: "privacy.html" },
      { name: "404 Error", href: "404.html" },
    ],

    features: [
      { icon: "zap", title: "Lightning-Fast Content Generation", desc: "Experience the power of AI-driven content creation, delivering high-quality text, images, and more in seconds." },
      { icon: "cpu", title: "Advanced AI Models at Your Fingertips", desc: "Leverage the latest cutting-edge AI models, providing you with the most accurate and sophisticated outputs available." },
      { icon: "shield", title: "Enterprise-Grade Security & Privacy", desc: "Rest easy knowing your data is protected with top-tier encryption and strict privacy protocols at every step." },
      { icon: "layers", title: "Seamless Multi-Format Output", desc: "Generate content in multiple formats effortlessly, from rich text documents to stunning visuals and functional code." },
      { icon: "bar-chart-2", title: "Real-Time Analytics & Insights", desc: "Track your content performance and AI usage with powerful built-in analytics that help you optimize workflows." },
      { icon: "settings", title: "Fully Customizable Workflows", desc: "Tailor AI outputs to your exact needs with intuitive customization options, making every generation uniquely yours." },
    ],

    testimonials: [
      { name: "Sarah Johnson", role: "Content Creator", img: "assets/images/user/user-01.png", quote: "This AI tool has completely transformed how I create content. I can now produce high-quality blog posts in minutes instead of hours." },
      { name: "Michael Chen", role: "Software Developer", img: "assets/images/user/user-02.png", quote: "The code generation feature is incredible. It understands context perfectly and produces clean, efficient code every time." },
      { name: "Emily Rodriguez", role: "Marketing Manager", img: "assets/images/user/user-03.png", quote: "Our marketing team's productivity has skyrocketed since adopting this tool. Campaign creation time has been cut in half." },
      { name: "David Park", role: "Entrepreneur", img: "assets/images/user/user-04.png", quote: "As a startup founder, this AI suite is a game-changer. It's like having an entire creative team at my fingertips." },
      { name: "Lisa Thompson", role: "UX Designer", img: "assets/images/user/user-05.png", quote: "The image generation capabilities are stunning. It perfectly captures the visual style I'm aiming for every single time." },
      { name: "James Wilson", role: "Academic Researcher", img: "assets/images/user/user-06.png", quote: "I use this daily for research summaries and report generation. The quality is consistently impressive and saves countless hours." },
    ],

    pricing: [
      {
        name: "Free", price: "$0", annualPrice: null, popular: false,
        desc: "Perfect for individuals getting started with AI tools.",
        btn: "Get Started",
        features: ["5,000 words per month", "Basic AI models", "3 projects", "Standard support", "API access"],
      },
      {
        name: "Starter", price: "$19", annualPrice: "$182", popular: false,
        desc: "Ideal for freelancers and small content creators.",
        btn: "Get Started",
        features: ["50,000 words per month", "Advanced AI models", "10 projects", "Priority support", "API access", "Custom templates"],
      },
      {
        name: "Pro", price: "$49", annualPrice: "$470", popular: true,
        desc: "Best for growing teams and professional creators.",
        btn: "Get Started",
        features: ["200,000 words per month", "Premium AI models", "Unlimited projects", "24/7 Priority support", "Advanced API access", "Custom templates", "Team collaboration"],
      },
      {
        name: "Enterprise", price: "Custom", annualPrice: null, popular: false,
        desc: "For large organizations with advanced requirements.",
        btn: "Contact Us",
        features: ["Unlimited words", "All AI models", "Unlimited projects", "Dedicated support", "Custom API solutions", "Advanced security", "Custom integrations", "SLA guarantee"],
      },
    ],

    faqs: [
      { q: "What is AI Agent and how does it work?", a: "AI Agent is a comprehensive AI-powered platform that provides a suite of content generation tools. It uses advanced language models and machine learning algorithms to generate high-quality text, images, code, and more based on your inputs and requirements." },
      { q: "How many words can I generate per month?", a: "The number of words you can generate depends on your subscription plan. Our Free plan includes 5,000 words per month, while paid plans range from 50,000 words on the Starter plan to unlimited words on the Enterprise plan." },
      { q: "Can I use AI Agent for commercial purposes?", a: "Yes, all paid plans allow you to use the generated content for commercial purposes. The content you create is yours to use however you see fit within our terms of service." },
      { q: "Is my data secure with AI Agent?", a: "Absolutely. We take data security very seriously. All your data is encrypted in transit and at rest. We never use your content to train our models without explicit consent, and we comply with major data protection regulations." },
      { q: "Can I cancel my subscription at any time?", a: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. When you cancel, you'll continue to have access to your plan features until the end of your current billing period." },
      { q: "Do you offer a free trial for paid plans?", a: "Yes, we offer a 14-day free trial for our Starter and Pro plans. No credit card is required to start the trial, and you can upgrade or cancel at any time during the trial period." },
    ],

    footerLinks: [
      {
        title: "Products", links: [
          { name: "Text Generator", href: "text-generator.html" },
          { name: "Image Generator", href: "image-generator.html" },
          { name: "Code Generator", href: "code-generator.html" },
          { name: "Video Generator", href: "video-generator.html" },
          { name: "Email Generator", href: "email-generator.html" },
        ]
      },
      {
        title: "Company", links: [
          { name: "About", href: "#" },
          { name: "Blog", href: "blog-grid.html" },
          { name: "Careers", href: "#" },
          { name: "Contact", href: "contact.html" },
        ]
      },
      {
        title: "Legal", links: [
          { name: "Privacy Policy", href: "privacy.html" },
          { name: "Terms of Service", href: "#" },
          { name: "Cookie Policy", href: "#" },
        ]
      },
    ],
  }));
});
