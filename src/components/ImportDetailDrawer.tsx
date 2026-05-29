import {
  Drawer,
  Box,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGetImportQuery } from '../api/importSlice'
import type { ImportRow, ImportStatus } from '../api/importSlice'

const STATUS_COLOR: Record<ImportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  pending: 'default',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
  partial: 'warning',
}

interface Props {
  importRow: ImportRow | null
  onClose: () => void
}

export function ImportDetailDrawer({ importRow, onClose }: Props) {
  const open = Boolean(importRow)
  const { data: detail, isFetching } = useGetImportQuery(importRow?.id ?? '', {
    skip: !importRow,
  })

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
            {importRow?.fileName ?? 'Import Detail'}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        {importRow && (
          <Chip
            label={importRow.status}
            color={STATUS_COLOR[importRow.status]}
            size="small"
            sx={{ alignSelf: 'flex-start', textTransform: 'capitalize' }}
          />
        )}

        <Divider />

        {isFetching && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {detail && !isFetching && (
          <>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Error Summary
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {detail.errorSummary ?? '—'}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Column Mapping
              </Typography>
              {detail.columnMapping ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontSize: 12,
                    overflow: 'auto',
                    maxHeight: 200,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(detail.columnMapping, null, 2)}
                </Box>
              ) : (
                <Typography variant="body2">—</Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Skipped Rows
              </Typography>
              <Typography variant="body2">{detail.skippedRows}</Typography>
            </Box>

            {detail.failedRowMessages.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Sample Failed Rows (up to 10)
                  </Typography>
                  <List dense disablePadding>
                    {detail.failedRowMessages.slice(0, 10).map((msg, i) => (
                      <ListItem key={i} disableGutters alignItems="flex-start">
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Drawer>
  )
}
