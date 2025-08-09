import { Avatar, Stack, Typography } from "@mui/material";
import { colors } from "@/common/colors";

type AssetProps = {
  title: string;
  imageSrc: string;
  subTitle?: string;
};

const Asset = ({ title, imageSrc, subTitle }: AssetProps) => {
  return (
    <Stack direction="row" gap={2}>
      <Avatar
        slotProps={{
          img: {
            loading: "lazy",
            decoding: "async",
            fetchPriority: "low",
          },
        }}
        alt={title}
        src={imageSrc}
        sx={{ width: 42, height: 42, bgcolor: `${colors.blue100}50` }}
      />
      <Stack justifyItems="center" alignContent="center" justifyContent="center">
        <Typography component="h2" fontWeight={700}>
          {title}
        </Typography>
        {subTitle && (
          <Typography color={colors.gray} component="h2" fontSize={12}>
            {subTitle}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export { Asset };
