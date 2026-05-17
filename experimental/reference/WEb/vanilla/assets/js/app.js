document.addEventListener('alpine:init', () => {
    Alpine.data('siteApp', () => ({
        mobileMenuOpen: false,
        scrolled: false,

        init() {
            window.addEventListener('scroll', () => {
                this.scrolled = window.scrollY > 20;
            });
            
            // Initialize Lucide icons if available
            if (window.lucide) {
                lucide.createIcons();
            }
        },

        navLinks: [
            { name: 'Features', href: '#features' },
            { name: 'Workflows', href: '#workflows' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'Company', href: '#about' }
        ],

        features: [
            { title: 'AI Automation', icon: 'zap', desc: 'Automate your repetitive tasks with our state-of-the-art AI agents.' },
            { title: 'Smart Workflows', icon: 'workflow', desc: 'Design complex workflows without writing a single line of code.' },
            { title: 'Seamless Integration', icon: 'layers', desc: 'Connect with over 200+ tools your team already uses daily.' },
            { title: 'Advanced Analytics', icon: 'bar-chart-3', desc: 'Gain deep insights into your AI agent performance and efficiency.' }
        ],

        workflows: [
            { step: '01', title: 'Design', desc: 'Map out your business process in our visual canvas.' },
            { step: '02', title: 'Connect', desc: 'Sync your data sources and third-party tools.' },
            { step: '03', title: 'Deploy', desc: 'Launch your agent with a single click.' }
        ],

        footerLinks: [
            {
                title: 'Product',
                links: [
                    { name: 'Features', href: '#' },
                    { name: 'Integrations', href: '#' },
                    { name: 'Pricing', href: '#' },
                    { name: 'Changelog', href: '#' }
                ]
            },
            {
                title: 'Company',
                links: [
                    { name: 'About Us', href: '#' },
                    { name: 'Careers', href: '#' },
                    { name: 'Blog', href: '#' },
                    { name: 'Contact', href: '#' }
                ]
            },
            {
                title: 'Resources',
                links: [
                    { name: 'Documentation', href: '#' },
                    { name: 'Help Center', href: '#' },
                    { name: 'Community', href: '#' },
                    { name: 'Privacy', href: '#' }
                ]
            }
        ],

        testimonials: [
            { name: 'Sarah Chen', role: 'CTO @ TechFlow', text: 'AIwork transformed our backend operations. We automated 80% of our ticket routing in just one week.' },
            { name: 'Marcus Wright', role: 'Founder @ ScaleUp', text: 'The visual workflow builder is a game changer. No more complex coding for simple automation.' },
            { name: 'Elena Rodriguez', role: 'Product Manager @ Innovate', text: 'Best-in-class AI agent platform. The integration support is unparalleled in the market today.' }
        ],

        faqs: [
            { q: 'How many AI agents can I deploy?', a: 'Depending on your plan, you can deploy from 5 agents to an unlimited number of agents with our Enterprise solution.' },
            { q: 'Can I integrate with my own API?', a: 'Yes! Our custom integration tool allows you to connect any REST or GraphQL API directly to your agents.' },
            { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption and do not store sensitive customer data used by your agents.' }
        ],

        activeFaq: null
    }));
});
