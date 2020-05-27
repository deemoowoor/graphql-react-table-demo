import React from "react"

import clsx from "clsx"
import { withStyles } from "@material-ui/core/styles"
import TableCell from "@material-ui/core/TableCell"
import TableRow from "@material-ui/core/TableRow"
import TableSortLabel from "@material-ui/core/TableSortLabel"
import Checkbox from "@material-ui/core/Checkbox"
import { AutoSizer, Column, Table } from "react-virtualized"

const styles = theme => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
  tableRow: {
    cursor: "pointer",
  },
  tableRowHover: {
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
    padding: "12px"
  },
  checkboxCell: {
    maxWidth: "50px",
    padding: "1px 0 0 0"
  },
  noClick: {
    cursor: "initial",
  },
})

class EnhancedVirtualizedTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = { selected: [] }
  }

  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  }

  headerRowRenderer = ({
    readonly,
    numSelected,
    rowCount,
    className,
    style,
    onSelectAllClick,
    columns,
  }) => {
    const { headerHeight, classes } = this.props

    return (
      <div className={className} role="row" style={style}>
        {!readonly ? (
          <TableCell
            component="div"
            className={clsx(
              classes.tableCell,
              classes.flexContainer,
              classes.noClick,
              classes.checkboxCell
            )}
            variant="head"
            style={{ height: headerHeight }}
            align={"left"}
            key={"checkbox-cell"}
            padding="checkbox"
          >
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all" }}
            />
          </TableCell>
        ) : null}
        {columns}
      </div>
    )
  }

  headerСellRenderer = ({ columnIndex, onRequestSort, orderBy, order }) => {
    const { headerHeight, columns, classes } = this.props

    const headCell = columns[columnIndex]

    const createSortHandler = property => event => {
      onRequestSort(event, property)
    }

    return (
      <TableCell
        component="div"
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={headCell.numeric || false ? "right" : "left"}
        padding={headCell.disablePadding ? "none" : "default"}
        sortDirection={orderBy === headCell.dataKey ? order : false}
      >
        <TableSortLabel
          active={orderBy === headCell.dataKey}
          direction={orderBy === headCell.dataKey ? order : "asc"}
          onClick={createSortHandler(headCell.dataKey)}
        >
          {headCell.label}
          {orderBy === headCell.dataKey ? (
            <span className={classes.visuallyHidden}>
              {order === "desc" ? "sorted descending" : "sorted ascending"}
            </span>
          ) : null}
        </TableSortLabel>
      </TableCell>
    )
  }

  rowRenderer = ({
    className,
    columns,
    key,
    index: rowIndex,
    rowData,
    style,
    onRowClick,
  }) => {
    const { readonly, classes } = this.props

    if (!rowData) {
      return null
    }

    const isItemSelected = !readonly && this.isSelected(rowData.id)

    return (
      <TableRow
        component="div"
        hover
        onClick={event => onRowClick({event, index: rowIndex, rowData})}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={key}
        selected={isItemSelected}
        className={className}
        style={style}
      >
        {!readonly ? (
          <TableCell
            component="div"
            padding="checkbox"
            className={clsx(
              classes.tableCell,
              classes.flexContainer,
              classes.checkboxCell
            )}
          >
            <Checkbox
              checked={isItemSelected}
              inputProps={{ "aria-labelledby": `enhanced-table-checkbox-0` }}
            />
          </TableCell>
        ) : null}
        {columns}
      </TableRow>
    )
  }

  cellRenderer = ({
    cellData,
    columnIndex,
    columnsSpec,
    classes
  }) => {
    return (
      <TableCell
        key={columnIndex}
        component="div"
        id={`enhanced-table-checkbox-${columnIndex}`}
        scope="row"
        padding="default"
        align={columnsSpec[columnIndex].numeric ? "right" : "left"}
        className={clsx(classes.tableCell, classes.flexContainer)}
      >
        {cellData}
      </TableCell>
    )
  }

  isSelected = id => this.props.selected.indexOf(id) !== -1

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    })
  }

  render() {
    const {
      columns,
      rows,
      rowCount,
      rowsOnPage,
      order,
      orderBy,
      onRequestSort,
      onRowClick,
      onSelectAllClick,
      readonly,
      rowHeight,
      headerHeight,
      styles,
      classes,
      selected,
      ...tableProps
    } = this.props

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: "inherit",
            }}
            headerHeight={headerHeight}
            className={classes.table}
            rowGetter={({ index }) => rows[index]}
            rowCount={rowsOnPage}
            rowClassName={this.getRowClassName}
            onRowClick={onRowClick}
            rowRenderer={rowProps =>
              this.rowRenderer({
                columnsSpec: columns,
                ...rowProps,
              })
            }
            headerRowRenderer={headerRowProps =>
              this.headerRowRenderer({
                readonly,
                rowCount: rowsOnPage,
                onSelectAllClick,
                numSelected: selected.length,
                columnsSpec: columns,
                ...headerRowProps,
              })
            }
            {...tableProps}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={headerProps =>
                    this.headerСellRenderer({
                      ...headerProps,
                      columnIndex: index,
                      onSelectAllClick,
                      onRequestSort,
                      readonly,
                      orderBy,
                      order,
                    })
                  }
                  cellRenderer={cellProps => this.cellRenderer({
                    classes,
                    columnsSpec: columns,
                    ...cellProps
                  })}
                  className={classes.flexContainer}
                  dataKey={dataKey}
                  flexGrow={1}
                  {...other}
                />
              )
            })}
          </Table>
        )}
      </AutoSizer>
    )
  }
}

const EnhancedTable = withStyles(styles)(EnhancedVirtualizedTable)
export default EnhancedTable
