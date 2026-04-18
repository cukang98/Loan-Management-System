import { redirect } from 'next/navigation';

const RootPage: React.FC = () => {
  redirect('/dashboard');
};

export default RootPage;
