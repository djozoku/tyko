import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Drawer,
  Button,
  IconButton,
  useMediaQuery,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  Breadcrumbs,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import HomeIcon from '@material-ui/icons/Home';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { deepOrange } from '@material-ui/core/colors';

import { useMenu } from '../hooks/useMenu';
import Link from '../components/Link';
import LetterAvatar from '../components/LetterAvatar';

import { useLogin } from './LoginContext';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    page: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContainer: {
      overflow: 'auto',
    },
    content: {
      overflow: 'auto',
      height: '100vh',
      flexGrow: 1,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
        marginRight: '10vw',
      },
    },
    userText: {
      textTransform: 'none',
      color: '#FFF',
    },
    titleText: {
      textTransform: 'none',
      color: '#FFF',
    },
    titleLogo: {
      width: 32,
      height: 32,
    },
    avatar: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
    },
    breadcrumbs: {
      paddingLeft: '4px',
      paddingBottom: '16px',
      borderBottom: '1px solid #ccc',
      marginBottom: '16px',
    },
    breadcrumbLink: {
      display: 'flex',
    },
    breadcrumbIcon: {
      marginRight: theme.spacing(0.5),
      width: 20,
      height: 20,
    },
  }),
);

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  sidebar?: boolean;
  breadcrumbs?: boolean;
  breadcrumb?: string;
  custom?: React.ReactNode;
}

const routeNames = {
  workplaces: 'TJK-paikat',
  students: 'Opiskelijat',
  groups: 'Ryhmät',
  teachers: 'Vastuuopettajat',
  account: 'Tili',
  404: '404',
};

const routes = ['workplaces', 'students', 'groups', 'teachers'] as const;

interface BreadcrumbsNavProps {
  breadcrumb?: string;
}

const BreadcrumbsNav = ({ breadcrumb }: BreadcrumbsNavProps) => {
  const router = useRouter();
  const classes = useStyles();
  const paths = router.pathname.split('/').slice(1);
  const path2 = paths.length >= 1 && paths[0];
  const idPath = paths.length >= 2 && router.query.id;

  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className={classes.breadcrumbs}>
      <Link color={path2 ? 'inherit' : 'textPrimary'} href="/" className={classes.breadcrumbLink}>
        <HomeIcon className={classes.breadcrumbIcon} />
        Etusivu
      </Link>
      {path2 && (
        <Link color={idPath ? 'inherit' : 'textPrimary'} href={`/${path2}`}>
          {(routeNames as any)[path2]}
        </Link>
      )}
      {idPath && (
        <Link color="textPrimary" href={`/${path2}/${idPath}`}>
          {breadcrumb || idPath}
        </Link>
      )}
    </Breadcrumbs>
  );
};

const Layout = ({
  children,
  title,
  sidebar = true,
  breadcrumbs = true,
  custom,
  breadcrumb,
}: LayoutProps) => {
  const router = useRouter();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const { el, open, close } = useMenu();
  const { loggedIn, login, logout, register, user, completed } = useLogin();
  const classes = useStyles();

  const logOut = async () => {
    close();
    setListOpen(false);
    await logout();
  };

  const account = () => router.push('/account');

  return (
    <>
      <Head>
        <title>{(title && `${title} – Tyko`) || 'Tyko'}</title>
      </Head>
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <div className={classes.title}>
              <Button
                onClick={() => router.push('/')}
                startIcon={
                  <Avatar src="/Gradient.png" variant="square" className={classes.titleLogo} />
                }
              >
                <Typography variant="h6" noWrap className={classes.titleText}>
                  Tyko
                </Typography>
              </Button>
            </div>
            {!isMobile && !loggedIn && (
              <div>
                <Button color="inherit" onClick={register}>
                  Rekisteröidy
                </Button>
                <Button color="inherit" onClick={login}>
                  Kirjaudu Sisään
                </Button>
              </div>
            )}
            {!isMobile && user && (
              <>
                <Button
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  onClick={open}
                  endIcon={
                    (user.avatar && <Avatar src={user.avatar} alt={user.name} />) || (
                      <LetterAvatar name={user.name} />
                    )
                  }
                >
                  <Typography variant="subtitle1" className={classes.userText}>
                    {user.name}
                  </Typography>
                </Button>
                <Menu id="user-menu" anchorEl={el} keepMounted open={!!el} onClose={close}>
                  <MenuItem onClick={account}>Tili</MenuItem>
                  <MenuItem onClick={logOut}>Kirjaudu Ulos</MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>

        <div className={classes.page}>
          {((sidebar && completed) || isMobile) && (
            <Drawer
              className={!isMobile ? classes.drawer : ''}
              variant={isMobile ? 'persistent' : 'permanent'}
              open={drawerOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <Toolbar />
              <div className={classes.drawerContainer}>
                {isMobile && (
                  <>
                    <List>
                      {user && (
                        <>
                          <ListItem button onClick={() => setListOpen(!listOpen)}>
                            <ListItemAvatar>
                              {(user.avatar && <Avatar src={user.avatar} alt={user.name} />) || (
                                <LetterAvatar name={user.name} />
                              )}
                            </ListItemAvatar>
                            <ListItemText primary={user.name} />
                            {listOpen ? <ExpandLess /> : <ExpandMore />}
                          </ListItem>
                          <Collapse in={listOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItem button onClick={account}>
                                <ListItemText primary="Tili" />
                              </ListItem>
                              <ListItem button onClick={logOut}>
                                <ListItemText primary="Kirjaudu Ulos" />
                              </ListItem>
                            </List>
                          </Collapse>
                        </>
                      )}
                      {!loggedIn && (
                        <div>
                          <ListItem button onClick={login}>
                            <ListItemText primary="Kirjaudu Sisään" />
                          </ListItem>
                          <ListItem button onClick={register}>
                            <ListItemText primary="Rekisteröidy" />
                          </ListItem>
                        </div>
                      )}
                    </List>
                    <Divider />
                  </>
                )}
                {sidebar && !custom && (
                  <List>
                    {routes.map((route) => {
                      const path = router.pathname.split('/').slice(1);
                      return (
                        <ListItem
                          key={route}
                          onClick={() => router.push(`/${route}`)}
                          button
                          selected={path[0] === route && path.length === 1}
                        >
                          <ListItemText primary={routeNames[route]} />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
                {sidebar && custom}
              </div>
            </Drawer>
          )}
          <main className={classes.content}>
            <Toolbar />
            {breadcrumbs && <BreadcrumbsNav breadcrumb={breadcrumb} />}
            <div style={{ flexGrow: 1 }}>{children}</div>
            <footer style={{ paddingTop: 24 }}>
              <Typography align="center">© {new Date().getFullYear()} Tyko</Typography>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
