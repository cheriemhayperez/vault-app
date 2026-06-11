"use client";

import {
  Camera,
  Check,
  ChevronRight,
  Mail,
  Palette,
  User,
} from "lucide-react";

import { SettingsCategoriesPanel } from "@/components/shared/settings-categories-panel";
import { SettingsPreferencesPanel } from "@/components/shared/settings-preferences-panel";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { VaultToast } from "@/components/ui/vault-toast";
import { VaultSubmitButton } from "@/components/shared/vault-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/features/settings/hooks/use-settings";
import {
  SETTINGS_SECTIONS,
  THEME_OPTIONS,
} from "@/features/settings/config";
import type { ThemePreference } from "@/utils/theme";
import type { ReactNode } from "react";

const ThemePreviewMockup = ({ themeId }: { themeId: ThemePreference }) => {
  if (themeId === "dark") {
    return (
      <div className="flex h-full gap-1.5 rounded-md bg-slate-800 p-2">
        <div className="w-1/4 rounded-sm bg-slate-700" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-2 rounded-sm bg-slate-700" />
          <div className="flex-1 rounded-sm bg-slate-700/80" />
        </div>
      </div>
    );
  }

  if (themeId === "system") {
    return (
      <div className="flex h-full overflow-hidden rounded-md">
        <div className="flex w-1/2 gap-1.5 bg-slate-50 p-2">
          <div className="w-1/3 rounded-sm bg-slate-200" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 rounded-sm bg-slate-200" />
            <div className="flex-1 rounded-sm bg-white" />
          </div>
        </div>
        <div className="flex w-1/2 gap-1.5 bg-slate-800 p-2">
          <div className="w-1/3 rounded-sm bg-slate-700" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 rounded-sm bg-slate-700" />
            <div className="flex-1 rounded-sm bg-slate-700/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-1.5 rounded-md bg-slate-50 p-2">
      <div className="w-1/4 rounded-sm bg-violet-100" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 rounded-sm bg-slate-200" />
        <div className="flex-1 rounded-sm bg-white shadow-sm" />
      </div>
    </div>
  );
};

const SectionPanelHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
      <Icon className="size-5 text-violet-600" />
    </div>
    <div>
      <h2 className="font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

const FieldLabel = ({
  icon: Icon,
  children,
}: {
  icon: typeof User;
  children: ReactNode;
}) => (
  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
    <Icon className="size-4 text-slate-500" />
    {children}
  </label>
);

export const SettingsPage = () => {
  const {
    preference,
    setTheme,
    photoInputRef,
    mobileNavRef,
    isLoading,
    activeSection,
    setActiveSection,
    email,
    fullName,
    profilePhotoUrl,
    isSaving,
    saveError,
    toastMessage,
    toastVariant,
    setToastMessage,
    mobileNavOverflow,
    hasProfileChanges,
    handleProfilePhotoChange,
    handleSaveProfile,
    handleFullNameChange,
  } = useSettings();

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <>
      {toastMessage ? (
        <VaultToast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      ) : null}

    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 font-sans text-sm tracking-tight text-slate-500">
          Manage your account and app preferences
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6">
        <div className="min-w-0 max-w-full">
          <div
            ref={mobileNavRef}
            className="overflow-x-auto pb-1 lg:hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
          >
            <div className="flex w-max gap-2">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    data-settings-tab={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-violet-500/35" : "bg-transparent"
                      }`}
                    >
                      <Icon
                        className={`size-4 ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {mobileNavOverflow ? (
            <p className="mt-1.5 text-center text-[11px] text-slate-400 lg:hidden">
              Swipe for more options
            </p>
          ) : null}

          <nav className="hidden space-y-1 lg:block" aria-label="Settings sections">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-900 hover:bg-violet-50/60 dark:hover:bg-slate-800/80"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon
                    className={`size-5 shrink-0 ${
                      isActive ? "text-white" : "text-slate-600"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{section.label}</span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        isActive ? "text-violet-100" : "text-slate-500"
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>
                  {isActive ? (
                    <ChevronRight className="size-4 shrink-0 text-white" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-slate-300" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:mt-0">
        {activeSection === "profile" ? (
          <>
            <div className="border-b border-slate-100 pb-6">
              <SectionPanelHeader
                icon={User}
                title="Profile"
                description="Manage your personal information"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-start gap-8 border-b border-slate-100 pb-8">
              <div className="flex shrink-0 flex-col items-center">
                <div className="relative">
                  {profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhotoUrl}
                      alt=""
                      className="size-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-full bg-slate-100">
                      <User className="size-11 text-slate-500" strokeWidth={1.25} />
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm ring-2 ring-white transition-colors hover:bg-violet-700"
                    aria-label="Upload profile photo"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Camera className="size-4" />
                  </button>
                </div>
                <div className="mt-3 max-w-[9.5rem] text-center text-xs leading-relaxed text-slate-400">
                  <p>Click the camera icon to upload a photo</p>
                  <p className="mt-1">Max size: 2MB</p>
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                <p className="mt-1 text-sm text-slate-500">
                  This will be displayed on your profile and in the sidebar.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Recommended: Square image, at least 200×200px
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <FieldLabel icon={Mail}>Email Address</FieldLabel>
                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  readOnly
                  tabIndex={-1}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Your email address is used for login and cannot be changed.
                </p>
              </div>
              <div>
                <FieldLabel icon={User}>Full Name</FieldLabel>
                <Input
                  className="mt-2 border-slate-200 bg-white"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => handleFullNameChange(event.target.value)}
                />
                <p className="mt-2 text-xs text-slate-400">
                  This name will appear in the sidebar and your profile.
                </p>
              </div>
              {saveError ? (
                <FormErrorBanner variant="page" message={saveError} />
              ) : null}
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
              <VaultSubmitButton
                type="button"
                label="Save Changes"
                mode="save"
                isProcessing={isSaving}
                disabled={!hasProfileChanges}
                onClick={() => void handleSaveProfile()}
              />
            </div>
          </>
        ) : null}

        {activeSection === "appearance" ? (
          <>
            <SectionPanelHeader
              icon={Palette}
              title="Appearance"
              description="Customize the app theme"
            />

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900">Theme</h3>
              <p className="mt-1 text-sm text-slate-500">
                Select your preferred appearance for the application.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {THEME_OPTIONS.map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = preference === theme.id;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTheme(theme.id)}
                      className={`flex flex-col rounded-xl border-2 p-4 text-left transition-colors ${
                        isSelected
                          ? "border-violet-500 bg-white ring-2 ring-violet-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`size-4 ${
                            isSelected ? "text-violet-600" : "text-slate-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            isSelected ? "text-violet-600" : "text-slate-900"
                          }`}
                        >
                          {theme.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {theme.description}
                      </p>

                      <div
                        className={`relative mt-4 h-28 overflow-hidden rounded-lg ${theme.previewClass}`}
                      >
                        <div className="absolute inset-2">
                          <ThemePreviewMockup themeId={theme.id} />
                        </div>
                        {isSelected ? (
                          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                            <Check className="size-3.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Tip:
                  </span>{" "}
                  System
                  theme will automatically switch between light and dark based on
                  your device&apos;s appearance settings.
                </p>
              </div>
            </div>
          </>
        ) : null}

        {activeSection === "preferences" ? <SettingsPreferencesPanel /> : null}

        {activeSection === "categories" ? <SettingsCategoriesPanel /> : null}
      </div>
    </div>
    </div>
    </>
  );
};
