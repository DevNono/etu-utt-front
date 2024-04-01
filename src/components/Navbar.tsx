'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import styles from './Navbar.module.scss';
import { useState } from 'react';
import { getMenu, setCollapsed } from '@/module/navbar';
import Link from 'next/link';
import { type NotParameteredTranslationKey } from '@/lib/i18n';
import { useAppTranslation } from '@/lib/i18n';
import Icons from '@/icons';
import { isLoggedIn, logout } from '@/module/session';
import Button from './UI/Button';

/**
 * The type defining all possible properties for a menu item
 * This is an internal type that should not be used when developping features.
 * */
type MenuItemProperties<Translate extends boolean> = {
  icon: () => JSX.Element;
  name: Translate extends true
    ? NotParameteredTranslationKey
    : Translate extends false
      ? string
      : NotParameteredTranslationKey | string;
  path: `/${string}`;
  submenus: MenuItem<false>[];
  needLogin: boolean;
  translate: Translate;
};

/**
 * An item displayed in the menu.
 * Requires one property in the followings (cannot be used together):
 * - {@link MenuItemProperties.path} the path the MenuItem will redirect on click
 * - {@link MenuItemProperties.submenus} a list of {@link MenuItem} describing all the items of the submenu.
 *
 * Can have an icon using {@link MenuItemProperties.icon}. By default, an icon can be used and is optional. Use the parameter {@link IncludeIcons} to require or forbid icons.
 */
export type MenuItem<
  IncludeIcons extends boolean = boolean,
  Translate extends boolean = boolean,
> = (IncludeIcons extends true
  ? Pick<MenuItemProperties<Translate>, 'icon'>
  : IncludeIcons extends false
    ? Partial<Record<'icon', never>>
    : Partial<Pick<MenuItemProperties<Translate>, 'icon'>>) &
  (
    | (Omit<MenuItemProperties<Translate>, 'path' | 'icon'> & Partial<Record<'path', never>>)
    | (Omit<MenuItemProperties<Translate>, 'submenus' | 'icon'> & Partial<Record<'submenus', never>>)
  );

/**
 * EtuUTT's main menu. It is the sidebar on the left of the screen.
 * The "collapsed/uncollapsed" state is saved in the browser's localStorage and will be kept the next time the user will use the browser.
 *
 * The menu supports hot modifications with using methods defined in {@link @/module/navbar}
 *
 * At the point, the navbar officially only supports 2 depth levels. Other levels are possible but may
 * not work as intended, especially when talking about displaying submenus contents.
 */
export default function Navbar() {
  // The selected menu name. This names includes the one of all of its ancestors, separated with commas.
  // For example the name "Menu2,Menu4" matches "Menu4" in the following hierarchy (> means a closed menu, - means an open menu):
  // > Menu1
  // - Menu2
  //   > Menu3
  //   - Menu4
  const [selectedMenuName, setSelectedMenuName] = useState<string>('');
  const menuItems = useAppSelector(getMenu);
  const loggedIn = true ;
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const { t, i18n } = useAppTranslation();
  const [language, setLanguage] = useState(i18n.language);

  /**
   * Switches the selected menu. If the menu (or one of its children) is already selected, the menu will close.
   * Otherwise, we open the menu.
   * */
  const toggleSelected = (itemName: string) => {
    if (selectedMenuName.startsWith(itemName)) setSelectedMenuName(itemName.split(',').slice(0, -1).join(','));
    else setSelectedMenuName(itemName);
  };

  /** Toggles the collapse mode */
  const toggleCollapsed = () => {
    dispatch(setCollapsed(!menuItems.collapsed));
  };

  /** Logs out the user */
  const logoutUser = () => {
    dispatch(logout());
  }

  /**
   * Creates a button as an {@link HTMLDivElement} using data from the provided {@link MenuItem}.
   *
   * The {@link after} property contains the name of all ancestors, separated with commas. Keep the default
   * value if the item is in the root menu.
   */
  const inflateButton = (item: MenuItem, after: string = '') => {
    return 'path' in item ? (
      ((item.needLogin && loggedIn) || !item.needLogin) && (
        <li>
          <Link href={item.path as string} className={`${styles.navigationLink}`} key={item.name}>
            {'icon' in item ? (item as MenuItem<true>).icon() : ''}
            <span>{item.translate ? t(item.name as NotParameteredTranslationKey) : item.name}</span>
          </Link>
        </li>
      )
    ) : (
      ((item.needLogin && loggedIn) || !item.needLogin) && (
        <div
          className={`${styles.button} ${styles.category} ${
            selectedMenuName.startsWith([after, item.name].join(',')) ? styles.containerOpen : styles.containerClose
          }`}
          style={{ maxHeight: `calc(${1 + item.submenus.length} * (2rem + 20px))` }}
          key={item.name}>
          <div
            className={`${styles.buttonContent} ${styles['indent-' + (after.split(',').length - 1)]}`}
            onClick={() => toggleSelected([after, item.name].join(','))}>
            {'icon' in item ? (item as MenuItem<true>).icon() : ''}
            <div className={styles.name}>{item.translate ? t(item.name as NotParameteredTranslationKey) : item.name}</div>
          </div>
          <div className={styles.buttonChildrenContainer}>
            {item.submenus.map((item) => inflateButton(item, [after, item.name].join(',')))}
          </div>
        </div>
      )
    );
  };

  // Based on : https://codepen.io/guled10/pen/zYqVqed
  return (
    <div className={`${styles.navigation} ${menuItems.collapsed ? styles.navigation__collapsed : ''}`}>
      {/* LOGO ETUUTT */}
      <a className={`${styles.navigationLogo}`}>
        <div>
          <div className={`${styles.navigationIcons}`} onClick={() => menuItems.collapsed && toggleCollapsed()}>
            <Icons.Menu />
            <Icons.LogoEtu />
          </div>
          <span>EtuUTT</span>
        </div>
        <div onClick={toggleCollapsed}>
          <Icons.Menu />
        </div>
      </a>
      {/* NAVIGATION */}
      <nav role="navigation">
        <ul>
          {menuItems.items.slice(0, menuItems.seperator).map((item) => inflateButton(item))}
          {/* <li className={styles.separator}></li> */}
          {menuItems.items.slice(menuItems.seperator).map((item) => inflateButton(item))}
        </ul>
      </nav>

      <div className={styles.bottom}>
        {/* ACCOUNT */}
        {loggedIn && (
          <a href="#" className={styles.profile}>
            <img src="https://picsum.photos/200" alt="Profile picture" />
            <div className={styles.infos}>
              <p className={styles.name}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className={styles.role}>Étudiant</p>
            </div>
            <div className={styles.actions}>
              <div className={styles.language} onClick={() => console.log('language')}>
                <Icons.Language />
                <select
                  value={language}
                  onChange={(e) => {
                    i18n.changeLanguage(e.target.value);
                    localStorage.setItem('etu-utt-lang', e.target.value);
                    setLanguage(e.target.value);
                  }}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div onClick={logoutUser}>
                <Icons.Logout />
              </div>
            </div>
          </a>
        )}

        {/* NOT LOGGED IN */}
        {!loggedIn && (
          <div className={styles.guest}>
            <a className={`${styles.navigationLink}`} href="#">
              <Icons.Login />
              <span>Connexion</span>
            </a>
            <div className={`${styles.buttons}`}>
              <Button onClick={() => console.log('login')}>Connexion</Button>
              <Button onClick={() => console.log('register')}>Inscription</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
