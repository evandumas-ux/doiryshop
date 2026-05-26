import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Header from '../components/Header';
const Navbar = Header;

const storyParagraphs = [
  'Certaines histoires commencent sans bruit.',
  "La mienne s'est écrite dans un quotidien où la fumée faisait partie du décor.",
  "Je n'ai jamais cherché à juger, ni à imposer.",
  "Mais j'ai voulu comprendre s'il existait une autre voie.",
  'Quelque chose de plus nuancé, de plus maîtrisé.',
  "Un geste qui reste, mais dont l'intention change.",
  '',
  "Alors j'ai commencé, simplement.",
  'Pour mes proches.',
  'En explorant les plantes, leurs textures, leurs arômes, leur simplicité.',
  "En cherchant une alternative qui ne brusque pas, mais qui accompagne.",
  '',
  'Peu à peu, ce qui était personnel est devenu évident.',
  'Si cela pouvait exister pour eux, cela pouvait exister pour d\'autres.',
  '',
  'Doiryshop est né de cette transition.',
  'Une manière de proposer, à ceux qui le souhaitent, une autre approche � plus douce, plus consciente, sans renier le geste.',
  "Ici, rien n'est excessif.",
  'Chaque produit est pensé comme une présence différente, plus calme, plus maîtrisée.',
  '',
  "Ce n'est pas une promesse.",
  "C'est une continuité.",
];

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-text pt-28 pb-16 px-6">
      <SEO
        title="Notre histoire"
        description="Découvrez l'histoire fondatrice de Doiryshop et la transition qui a donné naissance à notre approche."
        url="https://doiryshop.com/about"
      />
      <Navbar
        onOpenCart={() => {}}
        onOpenLogin={() => navigate('/login')}
        onLogout={() => {}}
        cartItemsCount={0}
        user={null}
      />
      <div className="max-w-3xl mx-auto text-center">
        <img
          src="/logo.jpg"
          alt="Logo Doiryshop"
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl mx-auto mb-8"
        />
        <h1 className="text-3xl md:text-4xl font-serif mb-10">Notre histoire</h1>
        <article className="max-w-[640px] mx-auto text-center space-y-3 leading-[1.8] text-text-light">
          {storyParagraphs.map((line, index) =>
            line ? (
              <p key={`${line}-${index}`}>{line}</p>
            ) : (
              <div key={`space-${index}`} className="h-4" aria-hidden="true" />
            )
          )}
        </article>
        <div className="mt-14">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Découvrir la collection � 
          </Link>
        </div>
      </div>
    </main>
  );
};

export default About;
