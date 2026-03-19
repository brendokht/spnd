"use client";

import { googleOAuthLogin, sendMagicLink, verifyOtp } from "@/app/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  MagicLinkSchemaType,
  OtpSchemaType,
} from "@spnd/shared-types/auth";
import { MagicLinkSchema, OtpSchema } from "@spnd/shared-types/auth";
import { type FormState, initialState } from "@spnd/shared-types/forms";
import { GoogleIcon } from "@spnd/ui/components/company-icons/google";
import { Button } from "@spnd/ui/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@spnd/ui/components/ui/field";
import { Input } from "@spnd/ui/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@spnd/ui/components/ui/input-otp";
import { Spinner } from "@spnd/ui/components/ui/spinner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSearchParams } from "next/navigation";
import { startTransition, useActionState, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
export default function LoginForm() {
  const searchParams = useSearchParams();

  const [loginError] = useState<string | null>(
    searchParams.get("error_description"),
  );

  const [magicLinkState, magicLinkAction, magicLinkPending] = useActionState(
    async (state: FormState | undefined, payload: FormData | null) => {
      /*
       * Normally would just pass the Server Action, however we need a way
       * to reset the state. No errors needs to be passed.
       */
      if (payload === null) {
        return initialState;
      }

      const response = await sendMagicLink(state, payload);

      return response;
    },
    initialState,
  );
  const [verifyOtpState, verifyOtpAction, verifyOtpPending] = useActionState(
    async (state: FormState | undefined, payload: FormData | null) => {
      /*
       * Normally would just pass the Server Action, however we need a way
       * to reset the state. No errors needs to be passed.
       */
      if (payload === null) {
        return initialState;
      }

      const response = await verifyOtp(state, payload);

      return response;
    },
    initialState,
  );

  const magicLinkForm = useForm<MagicLinkSchemaType>({
    resolver: zodResolver(MagicLinkSchema),
    defaultValues: {
      email: "",
    },
    mode: "all",
  });

  const otpForm = useForm<OtpSchemaType>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
    mode: "all",
  });

  const magicLinkFormRef = useRef<HTMLFormElement>(null);
  const verifyOtpFormRef = useRef<HTMLFormElement>(null);

  function magicLinkOnSubmit(data: MagicLinkSchemaType) {
    otpForm.setValue("email", data.email);
    startTransition(() =>
      magicLinkAction(new FormData(magicLinkFormRef.current!)),
    );
  }

  function otpOnSubmit() {
    startTransition(() =>
      verifyOtpAction(new FormData(verifyOtpFormRef.current!)),
    );
  }

  function resetForms() {
    otpForm.reset();
    magicLinkForm.reset();
    startTransition(() => {
      magicLinkAction(null);
      verifyOtpAction(null);
    });
  }

  return (
    <>
      {!magicLinkState.success ? (
        <form
          id="magic-link"
          ref={magicLinkFormRef}
          action={magicLinkAction}
          onSubmit={(e) => magicLinkForm.handleSubmit(magicLinkOnSubmit)(e)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={magicLinkForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="new@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {magicLinkState.errors &&
                    magicLinkState.errors.map((error) => (
                      <FieldError key={error}>{error}</FieldError>
                    ))}
                </Field>
              )}
            />
          </FieldGroup>
          <Button
            className="w-full"
            type="submit"
            form="magic-link"
            disabled={magicLinkPending || !magicLinkForm.formState.isValid}
          >
            Send Magic Link
            {magicLinkPending && <Spinner />}
          </Button>
        </form>
      ) : (
        <form
          id="otp"
          ref={verifyOtpFormRef}
          action={verifyOtpAction}
          onSubmit={(e) => otpForm.handleSubmit(otpOnSubmit)(e)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={otpForm.control}
              render={({ field }) => (
                <>
                  <Input {...field} type="hidden" />
                </>
              )}
            />
            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>One-time Code</FieldLabel>
                  <InputOTP
                    {...field}
                    id={field.name}
                    data-testid="otp-input"
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      otpForm.setValue("otp", e);
                    }}
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="mx-3" />
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {!verifyOtpState.success &&
                    verifyOtpState.errors &&
                    verifyOtpState.errors.map((error) => (
                      <FieldError key={error}>{error}</FieldError>
                    ))}
                </Field>
              )}
            />
            <Field>
              <Button
                type="submit"
                form="otp"
                disabled={verifyOtpPending || !otpForm.formState.isValid}
              >
                Verify
                {verifyOtpPending && <Spinner />}
              </Button>
              <Button
                disabled={verifyOtpPending}
                onClick={resetForms}
                variant={"destructive"}
              >
                Reset
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
      {loginError && <FieldError key={loginError}>{loginError}</FieldError>}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground mx-auto text-xs">or</span>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={googleOAuthLogin}
        disabled={magicLinkPending || verifyOtpPending}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </>
  );
}
