'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Eyup Akpinar',
    company: 'Flighthour',
    quote: 'Super Zusammenarbeit, gerne wieder!',
  },
  {
    name: 'Max Mustermann',
    company: 'Beispiel GmbH',
    quote: 'Professionelle Umsetzung und tolle Kommunikation.',
  },
  {
    name: 'Anna Schmidt',
    company: 'Schmidt & Partner',
    quote: 'Schnell, zuverlässig und kreativ. Absolut empfehlenswert!',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Das sagen{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              unsere Kunden
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vertrauen durch erfolgreiche Zusammenarbeit
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-primary-100 hover:border-primary-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
              <div className="text-5xl text-primary-400 mb-4 font-serif">"</div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="border-t border-primary-100 pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-primary-600">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
