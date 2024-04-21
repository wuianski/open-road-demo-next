import Link from "next/link";

import { Box, Chip, CardMedia, Stack, Skeleton, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';

import Tags from "@/components/Tags";
import { getAkaswapAssetUrl } from "@/lib/stringUtils";
import { getRandomObjectType, getRandomPeriod } from "@/lib/dummy";

export default function GeneralTokenCardGrid(props) {

  const data = props.data;
  const defaultColumnSettings = {
    grid: {
      xs: 4,
      sm: 8,
      md: 12,
    },
    item: {
      xs: 4,
    }
  };

  const columnSettings = {
    ...defaultColumnSettings,
    grid: {
      ...defaultColumnSettings.grid,
      ...(props.columnSettings?.grid || {})
    },
    item: {
      ...defaultColumnSettings.item,
      ...(props.columnSettings?.item || {})
    }
  };

  // TODO: replace dummy data with real data
  if (data) {
    data.forEach((item) => {
      if (!item.objectType) {
        item.objectType = getRandomObjectType();
      }

      if (!item.eventDate) {
        item.eventDate = getRandomPeriod();
      }

      if (!item.tokenImageUrl) {
        item.tokenImageUrl = item.thumbnailUri ? getAkaswapAssetUrl(item.thumbnailUri) : 'https://via.placeholder.com/400';
      }
    });
  }

  return (
    <>
      <Grid container spacing={4} columns={columnSettings.grid}>
        {!data &&
          Array.from(new Array(6)).map(
            (_, index) => (
              <Grid xs={columnSettings.item.xs} key={index}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 1 }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width={100} />
              </Grid>
            ))}
        {data &&
          data.map(
            ({
              tokenId,
              name,
              creator,
              tokenImageUrl,
              tags,
              contract,
              objectType,
              eventDate,
              eventPlace,
            }, index) => (
              <Grid key={index} xs={columnSettings.item.xs} >
                <Box>
                  <Link
                    href="/claimsToken/[contract]/[tokenId]"
                    as={`/claimsToken/${contract}/${tokenId}`}
                  >
                    <CardMedia
                      component="img"
                      alt="thumbnail"
                      height="230"
                      sx={{
                        mb: 1,
                      }}
                      image={tokenImageUrl}
                    />
                    <Box id="primary-info" mb={1}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="cardTitle" component="h6" gutterBottom>
                          {name}
                        </Typography>
                        <Chip label={objectType} size="small" />
                      </Stack>
                      <Typography variant="body1">
                        {creator}
                      </Typography>
                    </Box>
                    <Box id="secondary-info" mb={2}>
                      <Typography variant="body2">
                        {eventDate}
                      </Typography>
                      <Typography variant="body2">
                        {eventPlace}
                      </Typography>
                    </Box>
                    <Stack direction="row" flexWrap="wrap">
                      <Tags tags={tags.slice(0, 5)} />
                    </Stack>
                  </Link>
                </Box>
              </Grid>
            )
          )}
      </Grid>
    </>
  );
}