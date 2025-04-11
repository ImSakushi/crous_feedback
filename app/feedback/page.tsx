'use client';
import React, { useState, useEffect } from 'react';
import FormSection from '@/components/FormSection';
import CheckboxGroup from '@/components/CheckboxGroup';
import StarRating from '@/components/StarRating';
import RadioOption from '@/components/RadioOption';
import DropdownSelect from '@/components/DropdownSelect';
import { useFeedbackStore } from '@/store/feedback-store';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function MealFeedbackPage() {
  // États provenant du store (nouveaux attributs pour le plat principal et l'accompagnement)
  const {
    mainDishRating,
    setMainDishRating,
    mainDishTasteRating,
    setMainDishTasteRating,
    accompanimentRating,
    setAccompanimentRating,
    accompanimentTasteRating,
    setAccompanimentTasteRating,
    portionRating,
    setPortionRating,
    finishedPlate,
    setFinishedPlate,
    notEatenReason,
    setNotEatenReason,
    comment,
    setComment,
    resetForm,
  } = useFeedbackStore();

  // New local state for combined dish & accompaniment selection
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customDish, setCustomDish] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState<{ main_dishes: string[]; accompaniments: string[] } | null>(null);
  const router = useRouter();

  const reasonOptions = ["Portion trop grosse", "Pas à mon goût", "Pas très faim", "Autre"];

  // Récupération du menu du jour via l'API (les données comportent les options pour le plat principal et l'accompagnement)
  useEffect(() => {
    resetForm();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const mealPeriod = hour < 18 ? 'midi' : 'soir';
    fetch(`/api/menu?date=${dateStr}&mealPeriod=${mealPeriod}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          // On suppose ici que l'API retourne un objet avec "main_courses" et "accompaniments"
          setMenu({
            main_dishes: data.main_courses,
            accompaniments: data.accompaniments || []
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async () => {
    const finalDishes = [...selectedDishes];
    if (selectedDishes.includes("other") && customDish.trim() !== "") {
      const index = finalDishes.indexOf("other");
      if (index !== -1) {
        finalDishes[index] = customDish;
      }
    }

    if (
      mainDishRating === 0 ||
      mainDishTasteRating === 0 ||
      accompanimentRating === 0 ||
      accompanimentTasteRating === 0 ||
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
          main_dish_rating: mainDishRating,
          main_dish_taste_rating: mainDishTasteRating,
          accompaniment_rating: accompanimentRating,
          accompaniment_taste_rating: accompanimentTasteRating,
          portion_rating: portionRating,
          finished_plate: finishedPlate,
          not_eaten_reason: notEatenReason,
          comment: comment,
          chosen_main_dish: finalDishes.join(", "),
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        resetForm();
        setSelectedDishes([]);
        setCustomDish('');
        router.push('/thankyou');
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
      <h1>Ta contribution sur le repas du jour</h1>

      { /* Combined Selection Section */ }
      {(() => {
        const combinedOptions = menu ? [...menu.main_dishes, ...menu.accompaniments] : [];
        return (
          <FormSection
            title="Quel plat et accompagnement as-tu choisi ?"
            icon={<span role="img" aria-label="repas">🍽️</span>}
            subtitle="Sélectionnez une ou plusieurs options"
          >
            <CheckboxGroup
              options={combinedOptions}
              selected={selectedDishes}
              onSelect={setSelectedDishes}
              customValue={customDish}
              onCustomChange={setCustomDish}
              label=""
              className="customInput"
            />
          </FormSection>
        );
      })()}

      {/* 2. Note le plat principal */}
      <FormSection
        title="Note le plat principal"
        icon={<span role="img" aria-label="plat">🍽️</span>}
        subtitle="Comment as-tu trouvé le plat principal ?"
      >
        <StarRating rating={mainDishRating} onRatingChange={setMainDishRating} />
      </FormSection>

      {/* 3. Goût général du plat */}
      <FormSection
        title="À quel point aimeriez-vous revoir ce plat ?"
        icon={<span role="img" aria-label="goût">🍴</span>}
        subtitle="Souhaiteriez-vous que ce plat soit à nouveau proposé ?"
      >
        <StarRating rating={mainDishTasteRating} onRatingChange={setMainDishTasteRating} />
        {mainDishTasteRating === 1 && (
          <DropdownSelect
            options={["Trop salé", "Pas assez salé", "Trop épicé", "Fade", "Mauvais goût", "Autre"]}
            value={notEatenReason || ""}
            onChange={setNotEatenReason}
            placeholder="Pourquoi cette note ?"
          />
        )}
      </FormSection>

      {/* 4. Note l'accompagnement */}
      <FormSection
        title="Note l'accompagnement"
        icon={<span role="img" aria-label="accompagnement">🥦</span>}
        subtitle="Comment as-tu trouvé l'accompagnement ?"
      >
        <StarRating rating={accompanimentRating} onRatingChange={setAccompanimentRating} />
      </FormSection>

      {/* 5. Goût de l'accompagnement */}
      <FormSection
        title="À quel point aimeriez-vous revoir cet accompagnement ?"
        icon={<span role="img" aria-label="goût">🍽️</span>}
        subtitle="Souhaiteriez-vous que cet accompagnement soit à nouveau proposé ?"
      >
        <StarRating rating={accompanimentTasteRating} onRatingChange={setAccompanimentTasteRating} />
        {accompanimentTasteRating === 1 && (
          <DropdownSelect
            options={["Trop salé", "Pas assez salé", "Trop épicé", "Fade", "Mauvais goût", "Autre"]}
            value={notEatenReason || ""}
            onChange={setNotEatenReason}
            placeholder="Pourquoi cette note ?"
          />
        )}
      </FormSection>

      {/* 6. La quantité servie */}
      <FormSection
        title="La quantité servie (plat + accompagnement)"
        icon={<span role="img" aria-label="portion">🍱</span>}
        subtitle="La portion globale était-elle suffisante ?"
      >
        <StarRating rating={portionRating} onRatingChange={setPortionRating} />
      </FormSection>

      {/* 7. Fini ton assiette */}
      <FormSection
        title="As-tu fini ton assiette ?"
        icon={<span role="img" aria-label="assiette">🗑️</span>}
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
            value={notEatenReason || ""}
            onChange={setNotEatenReason}
            placeholder="Si non, pourquoi ?"
          />
        )}
      </FormSection>

      {/* 8. Commentaire facultatif */}
      <FormSection
        title="Un commentaire ? (facultatif)"
        icon={<span role="img" aria-label="commentaire">💬</span>}
      >
        <textarea
          placeholder="Partagez votre avis..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className={styles.textarea}
        />
      </FormSection>

      {/* 9. Bouton d'envoi */}
      <button onClick={handleSubmit} className={styles.submitButton} disabled={loading}>
        Envoyer
      </button>
      {message && <p>{message}</p>}

      <footer className={styles.footer}>
        <p className={styles.footerText}>© {new Date().getFullYear()} Discu-Table - Tous droits réservés</p>
      </footer>
    </div>
  );
}