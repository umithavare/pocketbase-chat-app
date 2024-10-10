import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#1F2937',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
});

const Header: React.FC = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          <Link href="/" passHref>
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  paddingRight: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar
                  alt="JUSTCHAT"
                  src="/assets/app-icon.png"
                  sx={{
                    width: 40,
                    height: 40,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    bgcolor: '#1F2937',
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#90caf9' }}>
                JUSTCHAT
              </Typography>
            </Box>
          </Link>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;