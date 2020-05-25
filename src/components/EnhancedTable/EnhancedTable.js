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

  headerСellRenderer = ({
    columnIndex,
    numSelected,
    rowCount,
    readonly,
    onRequestSort,
    onSelectAllClick,
    orderBy,
    order,
  }) => {
    const { headerHeight, columns, classes } = this.props

    const headCell = columns[columnIndex]

    if (columnIndex === 0 && !readonly)
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
      )

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
    rowIndex: index,
    key,
    rowData,
    style,
    onRowClick,
    columnsSpec,
  }) => {
    const { readonly, classes } = this.props

    if (!rowData) {
      return null
    }

    const isItemSelected = this.isSelected(rowData.id) && !readonly
    const labelId = `enhanced-table-checkbox-${index}`

    return (
      <TableRow
        component="div"
        hover
        onClick={onRowClick}
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
            className={clsx(classes.tableCell, classes.flexContainer)}
          >
            <Checkbox
              checked={isItemSelected}
              inputProps={{ "aria-labelledby": labelId }}
            />
          </TableCell>
        ) : null}

        {columns.map((item, index) => (
          <TableCell
            key={index}
            component="div"
            id={labelId}
            scope="row"
            padding="default"
            align={columnsSpec[index].numeric ? "right" : "left"}
            className={clsx(classes.tableCell, classes.flexContainer)}
          >
            {item}
          </TableCell>
        ))}
      </TableRow>
    )
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

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

    const carefulCellDataGetter = _ref => {
      if (!_ref.rowData) {
        return null
      }

      const dataKey = _ref.dataKey,
        rowData = _ref.rowData

      if (typeof rowData.get === "function") {
        return rowData.get(dataKey)
      } else {
        return rowData[dataKey]
      }
    }

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
                  cellDataGetter={carefulCellDataGetter}
                  cellRenderer={props => props.cellData}
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
