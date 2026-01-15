'use client';

import { motion } from 'framer-motion';

const testimonial = {
  name: 'Eyup Akpinar',
  company: 'Flighthour',
  quote: 'Super Zusammenarbeit, gerne wieder!',
};

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
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Erfolgreiche Zusammenarbeit
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white rounded-2xl p-10 md:p-12 shadow-lg border border-primary-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 to-primary-600" />
          <div className="text-6xl text-primary-400 mb-6 font-serif">"</div>
          <p className="text-gray-700 mb-8 italic text-xl md:text-2xl leading-relaxed">
            {testimonial.quote}
          </p>
          <div className="border-t border-primary-100 pt-6">
            <p className="font-semibold text-lg text-gray-900">{testimonial.name}</p>
            <p className="text-primary-600">{testimonial.company}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
