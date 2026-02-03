"use client";

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { generateSlug } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function SlugFormField({ nameFieldName }: { nameFieldName: string }) {
  const { control, setValue, getValues } = useFormContext();
  const watchedName = useWatch({ control, name: nameFieldName });
  const isInitialRender = useRef(true);

  useEffect(() => {
    // During initial render on an edit page, don't update the slug from the name
    // unless the slug is empty. This prevents overwriting an existing slug.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (watchedName && !getValues('slug')) {
        const newSlug = generateSlug(watchedName);
        setValue("slug", newSlug, { shouldValidate: false });
      }
      return;
    }
    
    // For subsequent renders (i.e. user typing), always update the slug.
    // This is safe because the user cannot edit the slug field directly.
    const newSlug = generateSlug(watchedName || '');
    // Only call setValue if the slug has actually changed to prevent unnecessary re-renders
    if (getValues('slug') !== newSlug) {
      setValue("slug", newSlug, { shouldValidate: true });
    }
  }, [watchedName, getValues, setValue, nameFieldName]);


  return (
    <FormField
      control={control}
      name="slug"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Slug</FormLabel>
          <FormControl>
            <Input readOnly placeholder="Auto-generated from name" {...field} />
          </FormControl>
          <FormDescription>
            This is the unique URL-friendly version of the name. It's automatically generated.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
