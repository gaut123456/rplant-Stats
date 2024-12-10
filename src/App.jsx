import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Button
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ChevronUpIcon from '@mui/icons-material/ExpandLess';
import ChevronDownIcon from '@mui/icons-material/ExpandMore';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ServerIcon from '@mui/icons-material/Speed';
import ClockIcon from '@mui/icons-material/AccessTime';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [darkMode, setDarkMode] = useState(true); // Track theme mode
  const [stats, setStats] = useState(null);
  const [extendedStats, setExtendedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const WALLET = "39LufvKS7pjW6yzqZXp2VKnogvtutUuWVc";
  const COIN = "skydoge";

  // Check for saved theme preference in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  const formatHashrate = (hashrate) => {
    if (hashrate > 1000000) return `${(hashrate / 1000000).toFixed(2)} MH/s`;
    if (hashrate > 1000) return `${(hashrate / 1000).toFixed(2)} KH/s`;
    return `${hashrate} H/s`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatCurrency = (value) => {
    return value ? parseFloat(value).toFixed(8) : '0.00000000';
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212'
      },
      text: {
        primary: '#fff'
      }
    }
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#f7f7f7'
      },
      text: {
        primary: '#000'
      }
    }
  });

  // Fetch data
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [basicResponse, extendedResponse] = await Promise.all([
          fetch(`https://pool.rplant.xyz/api/wallet/${COIN}/${WALLET}`),
          fetch(`https://pool.rplant.xyz/api/walletEx/${COIN}/${WALLET}`)
        ]);

        const [basicData, extendedData] = await Promise.all([
          basicResponse.json(),
          extendedResponse.json()
        ]);

        if (!basicData || basicData.error || !extendedData || extendedData.error) {
          throw new Error('Failed to fetch data');
        }

        setStats(basicData);
        setExtendedStats(extendedData);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
    const interval = setInterval(fetchAllStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Toggle theme and save preference
  const handleThemeToggle = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#ffe5e5' }}>
      <Card style={{ width: 300 }}>
        <CardHeader title="Connection Error" style={{ textAlign: 'center' }} />
        <CardContent>
          <Typography variant="body2" color="error" align="center">
            Unable to fetch mining stats: {error}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#f7f7f7', padding: '24px' }}>
        <div style={{ maxWidth: '960px', margin: 'auto' }}>
          <Typography variant="h4" align="center" gutterBottom style={{ color: darkMode ? '#fff' : '#000' }}>
            <ServerIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Rplant Mining Dashboard
          </Typography>

          <Button
            variant="contained"
            startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            onClick={handleThemeToggle}
            style={{
              marginBottom: '16px',
              backgroundColor: darkMode ? '#2196f3' : '#ff9800',
              color: darkMode ? '#000' : '#fff',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}
          >
            Toggle {darkMode ? 'Light' : 'Dark'} Theme
          </Button>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress />
            </div>
          ) : stats && extendedStats ? (
            <>
              {/* Balance Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <Card>
                  <CardHeader title="Unpaid Balance" action={<WalletIcon />} />
                  <CardContent>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(extendedStats.unpaid)}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Current Hashrate" action={<ServerIcon />} />
                  <CardContent>
                    <Typography variant="h5" color="secondary">
                      {formatHashrate(extendedStats.hashrate || 0)}
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Total Paid" action={<ClockIcon />} />
                  <CardContent>
                    <Typography variant="h5" color="textSecondary">
                      {formatCurrency(extendedStats.total)}
                    </Typography>
                  </CardContent>
                </Card>
              </div>

              {/* Miners Table */}
              <Card style={{ marginBottom: '24px' }}>
                <CardHeader title="Active Miners" />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Miner ID</TableCell>
                          <TableCell>Hashrate</TableCell>
                          <TableCell>Difficulty</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {extendedStats.miners?.map((miner, index) => (
                          <TableRow key={index}>
                            <TableCell>{miner.ID}</TableCell>
                            <TableCell>
                              <Tooltip title={`Precise Hashrate: ${miner.hashrate}`}>
                                <Badge>{formatHashrate(miner.hashrate)}</Badge>
                              </Tooltip>
                            </TableCell>
                            <TableCell>{miner.difficulty.toFixed(8)}</TableCell>
                            <TableCell>
                              <Badge color={miner.version ? "primary" : "error"}>
                                {miner.version || 'Unknown'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader title="Recent Payments" />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Amount</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Transaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {extendedStats.payments?.slice(0, 5).map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{formatDate(payment.time)}</TableCell>
                            <TableCell>
                              <Tooltip title={`Full Transaction Hash: ${payment.tx}`}>
                                <Typography noWrap>{payment.tx}</Typography>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: '#9e9e9e' }}>
              No mining data available
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
