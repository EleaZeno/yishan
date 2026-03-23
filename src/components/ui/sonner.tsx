import React from 'react';

export function Toaster(props: any) {
  return <div {...props} />;
}

export function toast(props: any) {
  console.log('toast', props);
}