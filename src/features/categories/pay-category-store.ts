import { deletePayCategory } from "@/api/categories";
import type { AppDispatch } from "@/store";
import { removeCategory } from "@/store/slices/categoriesSlice";
import { detachPayRecordsFromCategory } from "@/store/slices/financialSlice";
import type { PayCategory } from "@/types/categories";

export const removePayCategoryFromStore = (
  dispatch: AppDispatch,
  category: Pick<PayCategory, "id" | "kind">,
): void => {
  dispatch(removeCategory({ id: category.id, kind: category.kind }));
  dispatch(detachPayRecordsFromCategory(category.id));
};

export const deletePayCategoryForUser = async (
  userId: string,
  category: Pick<PayCategory, "id" | "kind">,
): Promise<void> => {
  await deletePayCategory(userId, category.id);
};

export const deletePayCategoryAndUpdateStore = async (
  dispatch: AppDispatch,
  userId: string,
  category: Pick<PayCategory, "id" | "kind">,
): Promise<void> => {
  await deletePayCategoryForUser(userId, category);
  removePayCategoryFromStore(dispatch, category);
};
