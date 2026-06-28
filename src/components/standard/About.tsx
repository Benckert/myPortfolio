import { useState } from 'react';
import { motion } from 'framer-motion';
import { content } from '../../data/content';
import { fadeUp, revealViewport } from '../../lib/motion';
import { Lightbox } from './Lightbox';
import TiltedCard from '../reactbits/TiltedCard';

export function About() {
  const [zoom, setZoom] = useState(false);
  const { bio, location, name, portraitUrl } = content.profile;
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.h2
          className="section__title"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <span>01.</span> About
        </motion.h2>
        <div className="about__layout">
          <div className="about__content">
            <motion.p
              className="about__bio"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={revealViewport}
            >
              {bio}
            </motion.p>
            {location && <p className="about__loc">📍 {location}</p>}
          </div>
          {portraitUrl && (
            <div className="about__portrait-wrap">
              <button
                type="button"
                className="portrait-btn"
                onClick={() => setZoom(true)}
                aria-label={`Enlarge portrait of ${name}`}
              >
                <TiltedCard
                  imageSrc={portraitUrl}
                  altText={`Portrait of ${name}`}
                  captionText="Click to enlarge"
                  containerHeight="240px"
                  containerWidth="240px"
                  imageHeight="240px"
                  imageWidth="240px"
                  rotateAmplitude={12}
                  scaleOnHover={1.06}
                  showMobileWarning={false}
                />
              </button>
              <Lightbox
                src={portraitUrl}
                alt={`Portrait of ${name}`}
                open={zoom}
                onClose={() => setZoom(false)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
