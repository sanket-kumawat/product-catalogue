import { EnquiryBodySchema } from '@product-catalogue/shared';
import { type FormEvent, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

import { useSubmitEnquiry } from '../api/use-submit-enquiry';

type FieldName = 'name' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

export function EnquiryDialog({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const enquiry = useSubmitEnquiry();

  function close() {
    setOpen(false);
    setErrors({});
    enquiry.reset();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = EnquiryBodySchema.safeParse({
      productId,
      name,
      email,
      message,
      ...(phone.trim() === '' ? {} : { phone }),
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          (key === 'name' ||
            key === 'email' ||
            key === 'phone' ||
            key === 'message') &&
          next[key] === undefined
        ) {
          next[key] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    enquiry.mutate(parsed.data);
  }

  return (
    <>
      <Button
        type='button'
        onClick={() => {
          setOpen(true);
        }}
      >
        Enquire
      </Button>
      <Dialog
        open={open}
        title='Send an enquiry'
        onClose={close}
      >
        {enquiry.isSuccess ? (
          <p className='text-foreground'>
            Thank you. Your enquiry has been sent.
          </p>
        ) : (
          <form
            className='space-y-3'
            noValidate
            onSubmit={onSubmit}
          >
            <Field
              id='enquiry-name'
              label='Name'
              error={errors.name}
              value={name}
              onChange={setName}
            />
            <Field
              id='enquiry-email'
              label='Email'
              type='email'
              error={errors.email}
              value={email}
              onChange={setEmail}
            />
            <Field
              id='enquiry-phone'
              label='Phone'
              type='tel'
              error={errors.phone}
              value={phone}
              onChange={setPhone}
            />
            <div className='space-y-1'>
              <Label htmlFor='enquiry-message'>Message</Label>
              <Textarea
                id='enquiry-message'
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
              />
              {errors.message ? (
                <p className='text-sm text-destructive'>{errors.message}</p>
              ) : null}
            </div>
            {enquiry.isError ? (
              <p className='text-sm text-destructive'>
                Your enquiry could not be sent. Try again.
              </p>
            ) : null}
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={enquiry.isPending}
              >
                Send enquiry
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}

function Field({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className='space-y-1'>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {error ? <p className='text-sm text-destructive'>{error}</p> : null}
    </div>
  );
}
