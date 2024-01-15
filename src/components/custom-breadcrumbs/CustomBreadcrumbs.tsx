// @mui
import { Box, Link, Stack, Typography, Breadcrumbs } from '@mui/material';
//
import { CustomBreadcrumbsProps } from './types';
import LinkItem from './LinkItem';

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  action,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;

  return (
    <Box className="breadcrumbs">
      <Stack
        direction="row"
        alignItems="center"
        className="breadcrumbs__content">
        <Box className="breadcrumbs__content-left">
          {/* HEADING */}
          {heading && (
            <Typography
              variant="h4"
              gutterBottom
              className="breadcrumbs__content-heading">
              {heading}
            </Typography>
          )}

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs
              separator={<Separator />}
              {...other}
              className="breadcrumbs__content-link">
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>
        <Box className="breadcrumbs__content-right">
          {action && (
            <Box className="breadcrumbs__content-action"> {action} </Box>
          )}
        </Box>
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              noWrap
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}>
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return <Box className="breadcrumbs__separator" component="span" />;
}
