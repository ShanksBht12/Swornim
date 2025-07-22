import {
  Target,
  Heart,
  Users,
  Award,
  Camera,
  MapPin,
  Palette,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react"

const AboutUs = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Passion for Excellence",
      description: "We're passionate about creating unforgettable experiences and exceeding expectations.",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Trust & Reliability",
      description: "Every vendor is verified and vetted to ensure you get the highest quality service.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Community First",
      description: "We believe in building strong relationships between clients and service providers.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "Innovation",
      description: "Constantly improving our platform with the latest technology and user feedback.",
      color: "from-purple-500 to-violet-600",
    },
  ]

  const stats = [
    { number: "2,500+", label: "Happy Clients", icon: <Heart className="w-5 h-5" /> },
    { number: "800+", label: "Verified Vendors", icon: <Award className="w-5 h-5" /> },
    { number: "5,000+", label: "Successful Events", icon: <TrendingUp className="w-5 h-5" /> },
    { number: "75+", label: "Cities Covered", icon: <MapPin className="w-5 h-5" /> },
  ]

  const team = [
    {
      name: "Priya Sharma",
      role: "Founder & CEO",
      image:
        "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      description: "10+ years in event management",
    },
    {
      name: "Raj Patel",
      role: "Head of Operations",
      image:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      description: "Expert in vendor relations",
    },
    {
      name: "Maya Singh",
      role: "Customer Success",
      image:
        "https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2",
      description: "Ensuring client satisfaction",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 chip chip-primary mb-8">
              <Users className="w-4 h-4" />
              <span>About Our Story</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              Making Events
              <span className="block text-gradient">Extraordinary</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Welcome to our Event Booking Platform! We're passionate about connecting clients with the finest service
              providers for weddings, parties, and all kinds of memorable events across Nepal.
            </p>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="card p-8">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  To make event planning seamless, transparent, and enjoyable by bringing together the best venues,
                  photographers, caterers, and decorators in one trusted platform.
                </p>
              </div>

              <div className="card p-8">
                <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  To become Nepal's most trusted event planning platform, where every celebration becomes a cherished
                  memory through exceptional service and attention to detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do and shape our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${value.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-spacing bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The passionate individuals working behind the scenes to make your events extraordinary.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="relative mb-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-slate-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-spacing">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">What We Offer</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive event services to make your special day perfect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Camera className="w-6 h-6" />, title: "Photography", desc: "Professional photographers" },
              { icon: <MapPin className="w-6 h-6" />, title: "Venues", desc: "Premium event spaces" },
              { icon: <Palette className="w-6 h-6" />, title: "Makeup", desc: "Beauty & styling services" },
              { icon: <Calendar className="w-6 h-6" />, title: "Planning", desc: "Full event coordination" },
            ].map((service, index) => (
              <div key={index} className="card p-6 text-center group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <div className="text-primary-600">{service.icon}</div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="card p-12 text-center bg-gradient-primary text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Plan Your Event?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who trust us for their special occasions. Let's make your event
              extraordinary together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary group">
                <span>Get Started Today</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-text text-white hover:bg-white/10">
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
