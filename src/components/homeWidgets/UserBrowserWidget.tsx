import { useAppTranslation } from '@/lib/i18n';
import Input from '@/components/UI/Input';
import { useState } from 'react';
import { WidgetLayout } from '@/components/homeWidgets/WidgetLayout';
import { useRouter } from 'next/navigation';
import Icons from '@/icons';

export default function UserBrowserWidget() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  return (
    <WidgetLayout title={t('homepage:userBrowser.title')} subtitle={t('homepage:userBrowser.subtitle')}>
      <Input
        value={search}
        onChange={setSearch}
        Icon={Icons.User}
        placeholder={t('homepage:userBrowser.searchBar.placeholder')}
        onEnter={() => router.push(`/users?q=${search}`)}
      />
    </WidgetLayout>
  );
}
