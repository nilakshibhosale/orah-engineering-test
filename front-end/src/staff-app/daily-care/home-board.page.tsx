import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import Button from "@material-ui/core/ButtonBase"
import { Icon, Input } from "semantic-ui-react"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { useDebounce } from "staff-app/utility/commonUtils"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [sortBy, setSortBy] = useState("first_name")
  const [searchedVal, setSearchedValue] = useState<string>()
  useEffect(() => {
    void getStudents()
  }, [getStudents])
  let findText: string | any
  const [filteredData, setFilteredData] = useState<any[]>([])
  // React.useEffect(() => {
  //   if (data) {
  //     setFilteredData(data?.students)
  //   }
  // }, [data])

  const onToolbarAction = React.useCallback((action: ToolbarAction, value?: string) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "sort") {
      if (value) {
        const selectedValueId = value.toLocaleLowerCase().replace(" ", "_")
        setSortBy(selectedValueId)
      }
    }
    if (action === "search") {
      setSearchedValue(value)
    }
  }, [])
  findText = useDebounce(searchedVal)
  const filterData = React.useMemo(() => {
    let items = data?.students.sort((obj1: any, obj2: any) => obj1[sortBy].localeCompare(obj2[sortBy]))
    if (!findText) {
      return items
    }
    return items?.filter((item) => {
      return item.first_name.toLowerCase().includes(findText.toLowerCase()) || item.last_name.toLowerCase().includes(findText.toLowerCase())
    })
  }, [findText, sortBy, data])

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && filterData?.length && (
          <>
            {filterData.map((s: any) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props

  const onSortData = (value: string) => {
    if (value !== "Sort By") {
      onItemClick("sort", value)
    }
  }
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false)
  const onSearch = (event: any) => {
    onItemClick("search", event.target.value)
  }
  return (
    <S.ToolbarContainer>
      <div>
        <Icon
          onClick={() => {
            setIsSortDialogOpen(true)
          }}
          name="sort"
          title="Sort"
        />

        {isSortDialogOpen && (
          <>
            <select onChange={(e) => onSortData(e.target.value)}>
              <option>Sort By</option>
              <option key="first_name" id="first_name">
                First Name
              </option>
              <option key="last_name" id="last_name">
                Last Name
              </option>
            </select>
            <Icon
              onClick={() => {
                setIsSortDialogOpen(false)
              }}
              name="close"
              title="Close"
              style={{ marginLeft: "10px" }}
            />
          </>
        )}
      </div>
      <div>
        <Input placeholder="Search..." onChange={onSearch} />
      </div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
