'use client';

import React, { useState, useEffect } from 'react';
import FormSection from '@/components/FormSection';
import StarRating from '@/components/StarRating';
import RadioOption from '@/components/RadioOption';
import DropdownSelect from '@/components/DropdownSelect';
import { useFeedbackStore } from '@/store/feedback-store';
import styles from './page.module.css';

export default function MealFeedbackPage() {
  const {
    appetizerRating,
    mainCourseRating,
    tasteRating,
    portionRating,
    finishedPlate,
    notEatenReason,
    comment,
    chosenStarter,
    chosenMainCourse,
    setAppetizerRating,
    setMainCourseRating,
    setTasteRating,
    setPortionRating,
    setFinishedPlate,
    setNotEatenReason,
    setComment,
    setChosenStarter,
    setChosenMainCourse,
    resetForm,
  } = useFeedbackStore();

  // Nouveaux états pour les valeurs personnalisées
  const [customStarter, setCustomStarter] = useState('');
  const [customMainCourse, setCustomMainCourse] = useState('');
  const [customDessert, setCustomDessert] = useState('');
  const [chosenDessert, setChosenDessert] = useState<string | null>(null);
  const [dessertRating, setDessertRating] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState<{ starters: string[]; main_courses: string[]; desserts?: string[] } | null>(null);

  const reasonOptions = [
    "Portion trop grosse",
    "Pas à mon goût",
    "Pas très faim",
    "Autre"
  ];

  // Récupération automatique du menu du jour
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const mealPeriod = hour < 18 ? 'midi' : 'soir';
    
    fetch(`/api/menu?date=${dateStr}&mealPeriod=${mealPeriod}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setMenu(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async () => {
    // Si l'utilisateur saisit son plat/entrée personnalisé, vérifier que le champ est renseigné
    if (chosenStarter === "other" && !customStarter.trim()) {
      alert("Veuillez renseigner votre entrée personnalisée");
      return;
    }
    if (chosenMainCourse === "other" && !customMainCourse.trim()) {
      alert("Veuillez renseigner votre plat personnalisé");
      return;
    }
    if (chosenDessert === null) {
      alert('Veuillez choisir votre dessert');
      return;
    }
    if (chosenDessert === "other" && !customDessert.trim()) {
      alert("Veuillez renseigner votre dessert personnalisé");
      return;
    }

    const finalChosenStarter = chosenStarter === "other" ? customStarter : chosenStarter;
    const finalChosenMainCourse = chosenMainCourse === "other" ? customMainCourse : chosenMainCourse;
    const finalChosenDessert = chosenDessert === "other" ? customDessert : chosenDessert;
    
    if (
      appetizerRating === 0 ||
      mainCourseRating === 0 ||
      tasteRating === 0 ||
      portionRating === 0 ||
      finishedPlate === null ||
      (finishedPlate === false && !notEatenReason)
    ) {
      alert('Formulaire incomplet. Merci de remplir tous les champs obligatoires.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appetizerRating,
          mainCourseRating,
          tasteRating,
          portionRating,
          finishedPlate,
          notEatenReason,
          comment,
          chosenStarter: finalChosenStarter,
          chosenMainCourse: finalChosenMainCourse,
          chosenDessert: finalChosenDessert,
          dessertRating,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setMessage('Merci pour votre feedback !');
        resetForm();
        setCustomStarter('');
        setCustomMainCourse('');
        setCustomDessert('');
        setChosenDessert(null);
      } else {
        setMessage("Erreur lors de l'envoi.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 style={{ textAlign: 'center' }}>Ta contribution sur le repas du jour</h1>

      <FormSection
        title="Quelle entrée as-tu choisie ?"
        icon={<span role="img" aria-label="entrée">🍽️</span>}
        subtitle="Sélectionne ton entrée parmi les options"
      >
        <div className={styles.radioGroup}>
          {menu && menu.starters && menu.starters.length > 0 && menu.starters.map((option, index) => (
            <RadioOption
              key={index}
              label={option}
              selected={chosenStarter === option}
              onSelect={() => setChosenStarter(option)}
            />
          ))}
          {/* Option personnalisée : radio button avec input intégré */}
          <div 
            className={styles.radioOption} 
            onClick={() => setChosenStarter("other")}
          >
            <div className={styles.radioButton}>
              {chosenStarter === "other" && <div className={styles.radioInner} />}
            </div>
            <input
              type="text"
              placeholder="Entrée"
              value={customStarter}
              onChange={(e) => {
                setCustomStarter(e.target.value);
                setChosenStarter("other");
              }}
              className={styles.radioInput}
            />
          </div>
        </div>
      </FormSection>
      
      {chosenStarter !== null && ((chosenStarter === "other" && customStarter.trim() !== "") || chosenStarter !== "other") && (
        <FormSection
          title="Note l'entrée d'aujourd'hui"
          icon={<span role="img" aria-label="salade">🥗</span>}
          subtitle="Comment as-tu trouvé l'entrée ?"
        >
          <StarRating 
            rating={appetizerRating} 
            onRatingChange={setAppetizerRating} 
          />
        </FormSection>
      )}

      <FormSection
        title={<>Quel plat as-tu choisi ? <span style={{ color: 'red' }}>*</span></>}
        icon={<span role="img" aria-label="plat">🍽️</span>}
        subtitle="Sélectionne ton plat parmi les options"
      >
        <div className={styles.radioGroup}>
          {menu && menu.main_courses && menu.main_courses.length > 0 && menu.main_courses.map((option, index) => (
            <RadioOption
              key={index}
              label={option}
              selected={chosenMainCourse === option}
              onSelect={() => setChosenMainCourse(option)}
            />
          ))}
          {/* Option personnalisée pour le plat */}
          <div 
            className={styles.radioOption} 
            onClick={() => setChosenMainCourse("other")}
          >
            <div className={styles.radioButton}>
              {chosenMainCourse === "other" && <div className={styles.radioInner} />}
            </div>
            <input
              type="text"
              placeholder="Autre plat"
              value={customMainCourse}
              onChange={(e) => {
                setCustomMainCourse(e.target.value);
                setChosenMainCourse("other");
              }}
              className={styles.radioInput}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title={<>Note le plat principal <span style={{ color: 'red' }}>*</span></>}
        icon={<span role="img" aria-label="soupe">🍜</span>}
        subtitle="Comment as-tu trouvé le plat principal ?"
      >
        <StarRating rating={mainCourseRating} onRatingChange={setMainCourseRating} />
      </FormSection>

      <FormSection
        title={<>Et le goût général ? <span style={{ color: 'red' }}>*</span></>}
        icon={<span role="img" aria-label="utensils">🍴</span>}
        subtitle="Le repas était-il bien assaisonné et équilibré ?"
      >
        <StarRating rating={tasteRating} onRatingChange={setTasteRating} />
      </FormSection>

      <FormSection
        title={<>La quantité servie <span style={{ color: 'red' }}>*</span></>}
        icon={<span role="img" aria-label="sandwich">🥪</span>}
        subtitle="Les portions étaient-elles suffisantes ?"
      >
        <StarRating rating={portionRating} onRatingChange={setPortionRating} />
      </FormSection>

      <FormSection
        title={<>As-tu fini ton assiette ? <span style={{ color: 'red' }}>*</span></>}
        icon={<span role="img" aria-label="trash">🗑️</span>}
      >
        <div className={styles.radioGroup}>
          <RadioOption
            label="✅ Oui, tout mangé"
            selected={finishedPlate === true}
            onSelect={() => setFinishedPlate(true)}
          />
          <RadioOption
            label="♻️ Non, il en restait"
            selected={finishedPlate === false}
            onSelect={() => setFinishedPlate(false)}
          />
        </div>
        
        {finishedPlate === false && (
          <DropdownSelect
            options={reasonOptions}
            value={notEatenReason}
            onChange={setNotEatenReason}
            placeholder="Si non, pourquoi ?"
          />
        )}
      </FormSection>

      <FormSection
        title="Quel dessert as-tu choisi ?"
        icon={<span role="img" aria-label="dessert">🍰</span>}
        subtitle="Sélectionne ton dessert parmi les options"
      >
        <div className={styles.radioGroup}>
          {menu && menu.desserts && menu.desserts.length > 0 && menu.desserts.map((option, index) => (
            <RadioOption
              key={index}
              label={option}
              selected={chosenDessert === option}
              onSelect={() => setChosenDessert(option)}
            />
          ))}
          {/* Option personnalisée pour le dessert */}
          <div 
            className={styles.radioOption} 
            onClick={() => setChosenDessert("other")}
          >
            <div className={styles.radioButton}>
              {chosenDessert === "other" && <div className={styles.radioInner} />}
            </div>
            <input
              type="text"
              placeholder="Autre dessert"
              value={customDessert}
              onChange={(e) => {
                setCustomDessert(e.target.value);
                setChosenDessert("other");
              }}
              className={styles.radioInput}
            />
          </div>
        </div>
      </FormSection>

      {chosenDessert !== null && ((chosenDessert === "other" && customDessert.trim() !== "") || chosenDessert !== "other") && (
        <FormSection
          title="Note le dessert d'aujourd'hui"
          icon={<span role="img" aria-label="dessert">🍰</span>}
        >
          <StarRating rating={dessertRating} onRatingChange={setDessertRating} />
        </FormSection>
      )}

      <FormSection
        title="Un commentaire ? (facultatif)"
        icon={<span role="img" aria-label="message">💬</span>}
      >
        <div className={styles.textareaContainer}>
          <textarea
            className={styles.textarea}
            placeholder="Partagez votre avis..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={150}
          />
        </div>
      </FormSection>

      <button onClick={handleSubmit} className={styles.submitButton} disabled={loading}>
        Envoyer
      </button>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}