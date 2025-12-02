import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaDiscord } from "react-icons/fa";

export default function HomepageContactPage() {
   return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
               <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Get in Touch
               </h1>
               <p className="text-xl text-gray-400">
                  We'd love to hear from you. Reach out to us anytime!
               </p>
            </div>

            {/* Contact Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Left Side - Address & Map */}
               <div className="space-y-6">
                  {/* Address Card */}
                  <Card className="bg-zinc-900 border-zinc-800">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                           <MapPin className="w-5 h-5 text-blue-400" />
                           Our Location
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                           Visit us at our campus
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-2 text-gray-300">
                           <p className="font-semibold text-lg text-white">
                              Government College of Engineering Kalahandi
                           </p>
                           <p>Bhawanipatna, Kalahandi</p>
                           <p>Odisha - 766002</p>
                           <p>India</p>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Google Map */}
                  <Card className="bg-zinc-900 border-zinc-800">
                     <CardContent className="p-0">
                        <iframe
                           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.237795724791!2d83.10372987527153!3d19.914381681470527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a24ef3382020aa3%3A0x6720328dfbfd451a!2sGovernment%20College%20Of%20Engineering%2CKalahandi(Autonomous)!5e0!3m2!1sen!2sin!4v1764689440519!5m2!1sen!2sin"
                           width="100%"
                           height="400"
                           style={{ border: 0 }}
                           allowFullScreen
                           loading="lazy"
                           referrerPolicy="no-referrer-when-downgrade"
                           className="rounded-lg"
                        />
                     </CardContent>
                  </Card>
               </div>

               {/* Right Side - Contact Information */}
               <div className="space-y-6">
                  {/* Email Card */}
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                           <Mail className="w-5 h-5 text-blue-400" />
                           Email Us
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                           Send us an email anytime
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-2">
                        <a 
                           href="mailto:codebreakers@gcekbpatna.ac.in" 
                           className="text-blue-400 hover:text-blue-300 transition-colors block"
                        >
                           codebreakers@gcekbpatna.ac.in
                        </a>
                        <a 
                           href="mailto:info@codebreakers.in" 
                           className="text-blue-400 hover:text-blue-300 transition-colors block"
                        >
                           info@codebreakers.in
                        </a>
                     </CardContent>
                  </Card>

                  {/* Phone Card */}
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                           <Phone className="w-5 h-5 text-green-400" />
                           Call Us
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                           We're available during college hours
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div>
                           <p className="text-sm text-gray-400">Secretary</p>
                           <a 
                              href="tel:+911234567890" 
                              className="text-green-400 hover:text-green-300 transition-colors text-lg"
                           >
                              +91 12345 67890
                           </a>
                        </div>
                        <Separator className="bg-zinc-800" />
                        <div>
                           <p className="text-sm text-gray-400">Assistant Secretary</p>
                           <a 
                              href="tel:+911234567891" 
                              className="text-green-400 hover:text-green-300 transition-colors text-lg"
                           >
                              +91 12345 67891
                           </a>
                        </div>
                        <Separator className="bg-zinc-800" />
                        <div>
                           <p className="text-sm text-gray-400">Treasurer</p>
                           <a 
                              href="tel:+911234567892" 
                              className="text-green-400 hover:text-green-300 transition-colors text-lg"
                           >
                              +91 12345 67892
                           </a>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Social Media Card */}
                  <Card className="bg-zinc-900 border-zinc-800">
                     <CardHeader>
                        <CardTitle className="text-white">Connect With Us</CardTitle>
                        <CardDescription className="text-gray-400">
                           Follow us on social media
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="flex gap-4">
                           <a 
                              href="https://discord.gg/codebreakersgcek" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-zinc-800 rounded-lg hover:bg-indigo-600 transition-colors"
                           >
                              <FaDiscord className="w-6 h-6" />
                           </a>
                           <a 
                              href="https://github.com/codebreakershcek" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-zinc-800 rounded-lg hover:bg-gray-700 transition-colors"
                           >
                              <Github className="w-6 h-6" />
                           </a>
                           <a 
                              href="https://instagram.com/codebreakersgcek" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-zinc-800 rounded-lg hover:bg-pink-600 transition-colors"
                           >
                              <Instagram className="w-6 h-6" />
                           </a>
                           <a 
                              href="https://linkedin.com/company/codebreakersgcek" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-zinc-800 rounded-lg hover:bg-blue-700 transition-colors"
                           >
                              <Linkedin className="w-6 h-6" />
                           </a>
                           <a 
                              href="https://twitter.com/codebreakersgcek" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-zinc-800 rounded-lg hover:bg-sky-500 transition-colors"
                           >
                              <Twitter className="w-6 h-6" />
                           </a>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   )
}