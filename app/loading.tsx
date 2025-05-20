import { ClipLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/20'>
      <ClipLoader color='#2563eb' size={90} />
    </div>
  );
}
