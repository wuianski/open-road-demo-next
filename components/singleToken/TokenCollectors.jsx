import Link from "next/link";
import { Box, Container, Stack, Typography } from "@mui/material";
import { truncateAddress } from "@/lib/stringUtils";

export default function TokenCollectors({ owners, ownerAddresses = [], ownerAliases = []}) {
  return (
    <Container maxWidth="lg">
      <Box py={6} textAlign='center' minHeight={300}>
        <Typography variant='h5' component='div' mb={4}>Collectors</Typography>
        <Box sx={{
          columnCount: {
            sm: 2,
            md: 3,
            lg: 4,
          },
          columnGap: 1,
        }}>
          {ownerAddresses.map((address, index) => (
            <Link
              key={index}
              href={{
                pathname: "/wallet/[address]",
                query: { address },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                mx="auto"
                sx={{
                  bgcolor: "white",
                  paddingX: 2,
                  paddingY: 1,
                  marginBottom: 1,
                  borderRadius: 1,
                }}
              >
                <Box>
                  {ownerAliases[address] || truncateAddress(address)}
                </Box>
                <Box
                  sx={{
                    opacity: 0.2  ,
                  }}
                >
                  {owners[address]}
                </Box>
              </Stack>
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
