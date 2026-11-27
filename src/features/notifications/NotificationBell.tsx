import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from './notificationApi';

export function NotificationBell() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: unread } = useUnreadCount();
  const { data } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = data?.content ?? [];
  const count = unread?.count ?? 0;

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="large">
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 440 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5 }}>
          <Typography variant="subtitle1">Notifications</Typography>
          {count > 0 && (
            <Button size="small" onClick={() => markAll.mutate()}>
              Mark all read
            </Button>
          )}
        </Stack>
        <Divider />
        {items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You're all caught up.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => !n.read && markRead.mutate(n.id)}
                sx={{ bgcolor: n.read ? 'transparent' : 'action.hover', alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={n.message ?? undefined}
                  primaryTypographyProps={{ fontWeight: n.read ? 400 : 600, variant: 'body2' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
