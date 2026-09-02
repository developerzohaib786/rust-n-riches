"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const STORE_NAME = "Zain Super Store";

function buildReminderMessage(customerName: string, totalDue: number) {
  return `Assalam-o-Alaikum ${customerName}, aap ka ${STORE_NAME} par ${totalDue.toFixed(
    2
  )} Rs ka khata baqaya hai. Meherbani farma kar jald ada karein. Shukriya.`;
}

// wa.me expects digits only, with country code and no leading zero/plus sign.
// A bare 10-digit number is assumed to be an Indian mobile missing its "91" country code.
function formatWhatsAppPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/**
 * MVP: this only opens a wa.me deep link with a prefilled message, no server
 * or WhatsApp account is involved, and nothing is tracked once the tab opens.
 *
 * Upgrade path for automated/tracked reminders (WhatsApp Cloud API, paid):
 * - Register a WhatsApp Business phone number with Meta and get a permanent
 *   access token + phone number ID from the Meta developer console.
 * - Author and get Meta's approval for a message template, business-initiated
 *   messages outside the 24h customer-service window must use an approved template.
 * - From a server route (e.g. POST /api/reminders), call
 *   https://graph.facebook.com/v20.0/{phone-number-id}/messages with the
 *   template name, the customer's phone, and the due amount as a template variable.
 * - Add a webhook route (e.g. /api/whatsapp/webhook) to receive delivery/read
 *   receipts from Meta and persist them (e.g. a ReminderLog model) so status
 *   can be shown next to each customer instead of just "opened WhatsApp".
 */
interface PaymentReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  totalDue: number;
}

export function PaymentReminderDialog({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  totalDue,
}: PaymentReminderDialogProps) {
  const [message, setMessage] = useState(() => buildReminderMessage(customerName, totalDue));

  useEffect(() => {
    if (open) setMessage(buildReminderMessage(customerName, totalDue));
  }, [open, customerName, totalDue]);

  function handleSendWhatsApp() {
    const phone = formatWhatsAppPhone(customerPhone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Review or edit the message before sending it to {customerName}.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="success" onClick={handleSendWhatsApp}>
            <MessageCircle className="h-4 w-4" />
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
