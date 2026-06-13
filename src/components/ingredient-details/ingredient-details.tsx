import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '../../services/store';
import { selectIngredients, selectIngredientsLoading } from '@selectors';

export const IngredientDetails: FC = () => {
  const { id } = useParams();
  const items = useSelector(selectIngredients);
  const loading = useSelector(selectIngredientsLoading);
  const ingredientData = items.find((i) => i._id === id);

  if (loading || !ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
