import React from 'react';
import { AppBar, Toolbar, Typography, Box  } from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#1f1f1f',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
});

const Header: React.FC = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          <Link href="/" passHref>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#90caf9' }}>
            JUSTCHAT
          </Typography>
          </Link>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;