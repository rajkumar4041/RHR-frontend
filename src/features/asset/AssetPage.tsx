import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import AssignIcon from '@mui/icons-material/AssignmentIndOutlined';
import ReturnIcon from '@mui/icons-material/AssignmentReturnOutlined';
import { useAssets, useReturnAsset } from './assetApi';
import { AssetFormDialog } from './AssetFormDialog';
import { AssignAssetDialog } from './AssignAssetDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ASSET_STATUSES, type Asset, type AssetStatus } from '@/types/asset';
import { useHasAnyRole } from '@/features/auth/useRoles';

const STATUS_COLOR: Record<AssetStatus, 'success' | 'warning' | 'default' | 'error'> = {
  AVAILABLE: 'success',
  ASSIGNED: 'warning',
  MAINTENANCE: 'warning',
  RETIRED: 'default',
};

function ReturnAction({ asset, onDone }: { asset: Asset; onDone: () => void }) {
  const ret = useReturnAsset(asset.id);
  return (
    <ConfirmDialog
      open
      title="Return asset"
      message={`Return ${asset.name} to the pool?`}
      confirmLabel="Return"
      onCancel={onDone}
      onConfirm={async () => {
        await ret.mutateAsync({ notes: null });
        onDone();
      }}
    />
  );
}

export function AssetPage() {
  const hasAnyRole = useHasAnyRole();
  const canWrite = hasAnyRole('COMPANY_ADMIN', 'HR_MANAGER');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [editing, setEditing] = useState<Asset | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toAssign, setToAssign] = useState<Asset | null>(null);
  const [toReturn, setToReturn] = useState<Asset | null>(null);

  const { data, isLoading, isError, refetch } = useAssets({
    page,
    size,
    status: status || undefined,
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: Asset) => {
    setEditing(a);
    setFormOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Assets</Typography>
          <Typography color="text.secondary">Track and assign company assets</Typography>
        </Box>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add asset
          </Button>
        )}
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} sx={{ p: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {ASSET_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Failed to load assets.
            </Alert>
          </Box>
        ) : !data || data.content.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No assets yet</Typography>
            <Typography color="text.secondary">
              {canWrite ? 'Add your first asset to get started.' : 'Nothing to show.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    {canWrite && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.content.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.assetCode}</TableCell>
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.category ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={a.status}
                          color={STATUS_COLOR[a.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      {canWrite && (
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(a)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {a.status === 'AVAILABLE' && (
                            <Tooltip title="Assign">
                              <IconButton size="small" color="primary" onClick={() => setToAssign(a)}>
                                <AssignIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {a.status === 'ASSIGNED' && (
                            <Tooltip title="Return">
                              <IconButton size="small" onClick={() => setToReturn(a)}>
                                <ReturnIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.totalElements}
              page={page}
              rowsPerPage={size}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </Paper>

      <AssetFormDialog open={formOpen} asset={editing} onClose={() => setFormOpen(false)} />

      <AssignAssetDialog
        open={Boolean(toAssign)}
        asset={toAssign}
        onClose={() => setToAssign(null)}
      />

      {toReturn && <ReturnAction asset={toReturn} onDone={() => setToReturn(null)} />}
    </Stack>
  );
}
