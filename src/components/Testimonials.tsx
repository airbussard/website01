'use client';

import { motion } from 'framer-motion';

const testimonial = {
  name: 'Eyup Akpinar',
  company: 'Flighthour',
  quote: 'Super Zusammenarbeit, gerne wieder!',
};

export default function Testimonials() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg md:text-xl text-gray-600 italic">
            "{testimonial.quote}"
          </p>
          <p className="mt-3 text-sm text-gray-500">
            — {testimonial.name}, <span className="text-primary-600">{testimonial.company}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
