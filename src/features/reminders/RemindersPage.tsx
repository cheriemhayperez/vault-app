"use client";

import {
  Calendar,
  Plus,
} from "lucide-react";

import { ReminderActionDialog } from "./reminder-action-dialog";
import { ReminderListItem } from "@/components/shared/reminder-list-item";
import { ReminderListToolbar } from "@/components/shared/reminder-list-toolbar";
import { FormErrorBanner } from "@/components/shared/form-error-banner";
import { ReminderModal } from "./reminder-modal";
import { VaultPageHeaderActions } from "@/components/layout/vault-page-header-actions";
import { Button } from "@/components/ui/button";
import { PageLoadingSpinner } from "@/components/ui/page-loading-spinner";
import { VaultToast } from "@/components/ui/vault-toast";
import { useReminders } from "@/features/reminders/hooks/use-reminders";
import { REMINDER_STATS } from "@/features/reminders/config";

export const RemindersPage = () => {
  const {
    isLoading,
    loadError,
    activeTab,
    setActiveTab,
    isModalOpen,
    editingReminder,
    actionTarget,
    actionVariant,
    isActionLoading,
    isActionClosing,
    toastMessage,
    toastVariant,
    setToastMessage,
    pageSize,
    currentPage,
    setCurrentPage,
    handlePageSizeChange,
    counts,
    tabReminders,
    totalTabPages,
    paginatedTabReminders,
    showingRange,
    hasAnyReminders,
    openCreate,
    openEdit,
    closeModal,
    openAction,
    closeAction,
    confirmAction,
  } = useReminders();

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

      <VaultPageHeaderActions>
        <Button
          type="button"
          className="bg-violet-600 shadow-sm hover:bg-violet-700"
          onClick={openCreate}
        >
          <Plus className="mr-2 size-4" />
          New Reminder
        </Button>
      </VaultPageHeaderActions>

      <div className="space-y-6">
        {loadError ? (
          <FormErrorBanner variant="page" message={loadError} />
        ) : null}

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {REMINDER_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 sm:gap-4 sm:p-5"
              >
                <div className={`shrink-0 rounded-lg p-2 sm:p-2.5 ${stat.tone}`}>
                  <Icon className="size-4 sm:size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                    {counts[stat.key]}
                  </p>
                  <p className="truncate text-xs text-slate-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="flex border-b border-slate-100">
            {(
              [
                { id: "upcoming" as const, label: "Upcoming" },
                { id: "completed" as const, label: "Completed" },
                { id: "dismissed" as const, label: "Dismissed" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-3.5 text-sm font-medium transition sm:flex-none sm:justify-start sm:gap-2 sm:px-5 ${
                    isActive
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  {count > 0 ? (
                    <span
                      className={
                        isActive ? "text-violet-600" : "text-slate-400"
                      }
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {tabReminders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              {!hasAnyReminders && activeTab === "upcoming" ? (
                <>
                  <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-violet-50">
                    <Calendar
                      className="size-7 text-violet-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    No reminders yet
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create your first reminder to keep track of important salary
                    dates, tax deadlines, and government contributions.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  No {activeTab} reminders.
                </p>
              )}
            </div>
          ) : (
            <>
              <ReminderListToolbar
                rangeStart={showingRange.start}
                rangeEnd={showingRange.end}
                totalCount={tabReminders.length}
                pageSize={pageSize}
                currentPage={currentPage}
                totalPages={totalTabPages}
                onPageSizeChange={handlePageSizeChange}
                onPageChange={setCurrentPage}
              />
              <ul className="bg-slate-50/40 pb-2">
                {paginatedTabReminders.map((reminder) => (
                <ReminderListItem
                  key={reminder.id}
                  reminder={reminder}
                  tab={activeTab}
                  onComplete={(item) => openAction(item, "complete")}
                  onEdit={openEdit}
                  onDismiss={(item) => openAction(item, "dismiss")}
                  onRestore={(item) => openAction(item, "restore")}
                  onDelete={(item) => openAction(item, "delete")}
                />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <ReminderModal
        open={isModalOpen}
        editingReminder={editingReminder}
        onClose={closeModal}
        onSuccess={setToastMessage}
      />

      <ReminderActionDialog
        open={Boolean(actionTarget && actionVariant)}
        variant={actionVariant ?? "dismiss"}
        isLoading={isActionLoading}
        isClosing={isActionClosing}
        onClose={closeAction}
        onConfirm={() => void confirmAction()}
      />
    </>
  );
};
