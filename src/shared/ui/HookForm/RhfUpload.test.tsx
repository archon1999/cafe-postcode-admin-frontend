/* @vitest-environment jsdom */

import { act, cleanup, render } from '@testing-library/react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RHFUpload } from './RhfUpload';

type UploadForm = {
  image?: File;
  images: File[];
};

type MockUploadProps = {
  value?: File | File[];
  onDrop?: (files: File[]) => void;
};

const uploadState = vi.hoisted(() => ({ props: undefined as MockUploadProps | undefined }));

vi.mock('../Upload', () => ({
  Upload: (props: MockUploadProps) => {
    uploadState.props = props;
    return null;
  },
  UploadAvatar: () => null,
  UploadBox: () => null,
}));

describe('RHFUpload', () => {
  afterEach(() => {
    cleanup();
    uploadState.props = undefined;
  });

  it('stores the first accepted file for a single upload', () => {
    let methods!: UseFormReturn<UploadForm>;

    const TestForm = () => {
      methods = useForm<UploadForm>({ defaultValues: { images: [] } });
      return (
        <FormProvider {...methods}>
          <RHFUpload<UploadForm> name="image" />
        </FormProvider>
      );
    };

    render(<TestForm />);
    const image = new File(['image'], 'single.png', { type: 'image/png' });

    act(() => uploadState.props?.onDrop?.([image]));

    expect(methods.getValues('image')).toBe(image);
  });

  it('appends accepted files to the current value for a multiple upload', () => {
    const existingImage = new File(['existing'], 'existing.png', { type: 'image/png' });
    let methods!: UseFormReturn<UploadForm>;

    const TestForm = () => {
      methods = useForm<UploadForm>({ defaultValues: { images: [existingImage] } });
      return (
        <FormProvider {...methods}>
          <RHFUpload<UploadForm> name="images" multiple />
        </FormProvider>
      );
    };

    render(<TestForm />);
    const nextImage = new File(['next'], 'next.png', { type: 'image/png' });

    act(() => uploadState.props?.onDrop?.([nextImage]));

    expect(methods.getValues('images')).toEqual([existingImage, nextImage]);
  });
});
