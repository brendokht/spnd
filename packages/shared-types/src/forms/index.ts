type ErrorFormState = {
  success: false;
  errors: Array<string>;
};

type SuccessFormState = {
  success: true;
  message: string;
};

export type FormState = SuccessFormState | ErrorFormState;

// The state of an initial form is no success with empty errors
export const initialState: ErrorFormState = {
  success: false,
  errors: [],
};
