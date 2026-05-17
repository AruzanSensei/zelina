const lightbox = GLightbox({
  selector: ".video-popup",
  type: "video",
  source: "youtube", // or 'vimeo'
  width: 900,
  autoplayVideos: true,
});

document.addEventListener('alpine:init', () => {
  Alpine.data('aiApp', () => ({
    mobileMenuOpen: false,
    activeDropdown: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
    activeTab: 'text',
    showAll: false,
    annual: false,

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      this.applyTheme();
    },

    applyTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    },

    toggleDropdown(dropdown) {
      if (window.innerWidth < 1024) {
        this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
      }
    },

    closeDropdowns() {
      this.activeDropdown = null;
    },

    init() {
      this.applyTheme();
      
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && !e.target.closest('.dropdown-menu') && !e.target.closest('.mobile-dropdown-toggle')) {
          this.closeDropdowns();
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
          this.activeDropdown = null;
          this.mobileMenuOpen = false;
        }
      });
      
      // Initialize Lucide icons
      lucide.createIcons();
    },

    // Data for Loops
    products: [
      { id: 'text', name: 'Text Generator', href: 'text-generator.html', icon: 'file-text', color: 'purple', img: 'assets/images/tab-image/tab-image-1', title: 'Easiest way to generate text' },
      { id: 'image', name: 'Image Generator', href: 'image-generator.html', icon: 'image', color: 'orange', img: 'assets/images/tab-image/tab-image-2', title: 'Easiest way to generate images' },
      { id: 'code', name: 'Code Generator', href: 'code-generator.html', icon: 'code', color: 'blue', img: 'assets/images/tab-image/tab-image-3', title: 'Easiest way to generate code' },
      { id: 'video', name: 'Video Generator', href: 'video-generator.html', icon: 'play-box', color: 'yellow', img: 'assets/images/tab-image/tab-image-4', title: 'Easiest way to generate videos' },
      { id: 'email', name: 'Email Generator', href: 'email-generator.html', icon: 'mail', color: 'cyan', img: 'assets/images/tab-image/tab-image-5', title: 'Easiest way to generate emails' }
    ],

    pages: [
      { name: 'Dashboard', href: 'dashboard.html' },
      { name: 'Pricing', href: 'pricing.html' },
      { name: 'Blog Grid', href: 'blog-grid.html' },
      { name: 'Blog Details', href: 'blog-details.html' },
      { name: 'Sign In', href: 'signin.html' },
      { name: 'Sign Up', href: 'signup.html' },
      { name: 'Reset Password', href: 'forgot-password.html' },
      { name: 'Privacy Policy', href: 'privacy.html' },
      { name: '404 Error', href: '404.html' }
    ],

    features: [
      { title: 'Seamless Content Creation AI', desc: 'Let our AI-powered service simplify your content creation process. Start using AI today!', icon: 'edit-3' },
      { title: 'Your Ideas, Powered by Our Technology', desc: 'Discover how AI can transform your ideas into captivating content with our high-quality service.', icon: 'zap' },
      { title: 'Intelligent Writing by Powerful AI', desc: 'Effortlessly access AI-generated content for your blogs, websites, and more with our high-quality, convenient service.', icon: 'cpu' },
      { title: 'AI Generation Made Life Easier', desc: 'Experience effortless content creation with our AI service. Write less, accomplish more.', icon: 'message-square' },
      { title: 'Premium AI-Generated Content', desc: 'Get expertly crafted content in no time with our AI service. Where quality meets speed.', icon: 'award' },
      { title: 'Super Fast AI Writing Companion', desc: 'Partner with AI to create content that connects with your audience. Give it a try now.', icon: 'lightning' } // mapping Lucide lightning to something close or using lucide
    ],

    testimonials: [
      { name: 'Ralph Edwards', role: 'Big Kahuna Burger Ltd', img: 'assets/images/users/user-1.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' },
      { name: 'Albert Flores', role: 'Biffco Enterprises Ltd.', img: 'assets/images/users/user-2.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' },
      { name: 'Jenny Wilson', role: 'Acme Co.', img: 'assets/images/users/user-3.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' },
      { name: 'Esther Howard', role: 'Barone LLC.', img: 'assets/images/users/user-4.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' },
      { name: 'Darlene Robertson', role: 'Abstergo Ltd.', img: 'assets/images/users/user-5.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' },
      { name: 'Devon Lane', role: 'Binford Ltd.', img: 'assets/images/users/user-6.png', quote: 'As a Senior Software Developer I found TailAdmin perfect write code that easy can be used in my projects.' }
    ],

    pricing: [
      { name: 'Free', price: '0', desc: 'Sed ut perspiciatis unde omnis iste natus ut perspic iatis.', btn: 'Try it for free', features: ['Some limited features only', '400 messaging limits', 'Limited Projects', '20,000 Words'] },
      { name: 'Plus plan', price: '$20', annualPrice: '$16', popular: true, desc: 'Billed at periods under limits, see rates of people who use.', btn: 'Purchase Now', features: ['Everything in Free', '2000 messaging limits', 'Unlimited Projects', 'Open AI Key Integration', '80,000 Words', 'Consistent support'] },
      { name: 'Pro plan', price: '$30', annualPrice: '$24', desc: 'Billed at periods under limits, see rates of people who use.', btn: 'Purchase Now', features: ['Everything in Free', '5000 messaging limits', 'Unlimited Projects', 'Open AI Key Integration', '1,00,000 Words', 'Consistent support'] },
      { name: 'Enterprise', price: "Let's talk", desc: 'Sed ut perspiciatis unde omnis iste natus ut perspic iatis.', btn: 'Contact Sales', features: ['Everything in Free', '5000 messaging limits', 'Unlimited Projects', 'Open AI Key Integration', 'Unlimited Words', 'Consistent support'] }
    ],

    faqs: [
      { q: 'Do I get free updates?', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean luctus magna quis tellus euismod, eget pharetra leo mollis. Donec eget lacus non elit blandit pharetra vitae volutpat libero.' },
      { q: 'What does the number of "Projects" refer to?', a: 'The number of "Projects" refers to the total number of separate workspaces you can create and manage within your account.' },
      { q: 'Can I upgrade to a higher plan?', a: 'Yes, you can upgrade to a higher plan at any time. Your new features will be available immediately after upgrading.' },
      { q: 'What does "Unlimited Projects" mean?', a: '"Unlimited Projects" means you can create as many projects as you need without any restrictions.' },
      { q: 'How can I add Open AI Key?', a: 'To add your OpenAI API key, go to your account settings and navigate to the "API Keys" section.' }
    ],

    footerLinks: [
      {
        title: 'Services',
        links: [
          { name: 'Status', href: '#' },
          { name: 'Pricing', href: 'pricing.html' },
          { name: 'FAQ', href: '#' },
          { name: 'Help Docs', href: '#' },
          { name: 'Privacy Policy', href: 'privacy.html' }
        ]
      },
      {
        title: 'Features',
        links: [
          { name: 'HTML File Upload', href: '#' },
          { name: 'HTML website hosting', href: '#' },
          { name: 'Free Image Hosting', href: '#' },
          { name: 'Upload PDF Online', href: '#' },
          { name: 'Free Zip file hosting', href: '#' }
        ]
      },
      {
        title: 'Account',
        links: [
          { name: 'Login', href: 'signin.html' },
          { name: 'Sign Up', href: 'signup.html' },
          { name: 'Reset Password', href: 'forgot-password.html' },
          { name: 'Support', href: 'contact.html' }
        ]
      }
    ],

    currentYear: new Date().getFullYear()
  }));
});
