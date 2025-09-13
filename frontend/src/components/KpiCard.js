import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const KpiCard = ({ title, value, icon, prefix = '', suffix = '', color, isText = false }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={cardVariants} whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }} className="glass-card p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-gray-500 dark:text-gray-400">{title}</h3>
        <div className={color}>{icon}</div>
      </div>
      {isText ? (
        <p className="text-3xl font-bold mt-2 truncate" title={suffix}>{suffix}</p>
      ) : (
        <p className="text-4xl font-bold mt-2">
          <CountUp prefix={prefix} suffix={suffix} end={value} duration={2} separator="," />
        </p>
      )}
    </motion.div>
  );
};

export default KpiCard;